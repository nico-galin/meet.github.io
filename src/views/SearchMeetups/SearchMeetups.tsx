import { useCallback, useEffect, useState } from 'react'

import {
  Box, StackDivider, VStack,
} from '@chakra-ui/react'
import ProductHeader from 'components/ProductHeader';
import SearchBar from 'components/SearchBar';
import { useRef } from 'react';
import { useNavigate } from 'react-router-dom'
import { meetup_options } from 'constants/search_options';
import executeSearch from 'hooks/executeSearch';
import useAuth from 'contexts/auth/useAuth';

interface Props {}

const SearchMeetups = ({ }: Props) => {
  const navigate = useNavigate();
  const ref = useRef() as React.MutableRefObject<HTMLInputElement>;
  const { user } = useAuth();
  const filters = !!user && !!user.company_name ? meetup_options[user.company_name] : [];

  const onSubmit = (searchText: string, filters: any) => {
    executeSearch({ navigate, options: { destination: "browse", filters, searchText }})
  }

  return (
    <VStack alignItems="center" paddingTop="30vh">
      <ProductHeader company={!!user?.company_name ? user.company_name : ""} product='Meetups'/>
      <StackDivider height="5px" />
      <SearchBar onSubmit={onSubmit} onFocus={() => window.scrollBy(0, 1000)} onChange={() => {}} filters={filters} placeholder="Search Meetups..."/>
      <Box height="800px" width="1px" />
    </VStack>
  )
};

export default SearchMeetups;