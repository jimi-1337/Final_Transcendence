import { Controller, Get, Param, Body, Post } from '@nestjs/common';
import SearchService from './search.service';

@Controller()
export default class SearchController {
  constructor(private readonly searchservice: SearchService) {}

  @Get('/search')
  get_search_elems() {
    return this.searchservice.get_search_elems();
  }

  @Get('/search/mod')
  get_search_mods() {
    return this.searchservice.get_search_mods();
  }

  @Post('/user')
  get_user_data(@Body() b) {
    return this.searchservice.get_user_data(b.data.username, b.data.me);
  }
}
