import { HttpStatus, Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { PrismaClient } from '@prisma/client';

import { PaginationDto } from 'src/common';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class ProductsService extends PrismaClient implements OnModuleInit {

  private readonly logger = new Logger('ProductsService')

  onModuleInit() {
    this.$connect();
    this.logger.log('Prisma connected');

  }

  create(createProductDto: CreateProductDto) {
    return this.product.create({ data: createProductDto });
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit, page } = paginationDto;

    const [totalProducts, products] = await Promise.all([
      this.product.count({ where: { available: true } }),
      this.product.findMany({
        where: { available: true },
        skip: (page - 1) * limit,
        take: limit,
      }),
    ]);

    const totalPages = Math.ceil(totalProducts / limit);

    return {
      totalProducts,
      page,
      totalPages,
      next: (totalProducts - (page * limit)) > 0 ? `/products?page=${page + 1}&limit=${limit}` : null,
      prev: (page - 1 > 0) ? `/products?page=${page - 1}&limit=${limit}` : null,
      products
    }
  }


  async findOne(id: number) {
    const product = await this.product.findFirst({
      where: { id, available: true }
    });
    if (!product) throw new RpcException({
      message: `Product not found with id #${id}`,
      statusCode: HttpStatus.BAD_REQUEST
    });
    return product;
  }

  async update(id: number, updateProductDto: UpdateProductDto) {
    const { id: __, ...data } = updateProductDto

    await this.findOne(id);

    const productUpdated = await this.product.update({
      where: { id },
      data
    });
    return productUpdated
  }

  async remove(id: number) {
    await this.findOne(id);
    // return await this.product.delete({ where: { id } });
    const product = await this.product.update({
      where: { id },
      data: { available: false }
    });

    return product
  }

  async validateProducts(ids: number[]){
    // elimina los valores duplicados del array ids y lo convierte de nuevo en un arra
    ids = Array.from(new Set(ids));

    const products = await this.product.findMany({
      where: { id: { in: ids } }
    });

    if(products.length !== ids.length) throw new RpcException({
      message: `Some products not found`,
      statusCode: HttpStatus.BAD_REQUEST
    });

    return products;
  }
}
