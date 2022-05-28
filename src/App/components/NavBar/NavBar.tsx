import {
  Stack,
  Button,
  HStack,
  IconButton,
  Image,
  Link,
  Text,
} from '@chakra-ui/react'
import { useLocation, Link as rLink } from 'react-router-dom'
import { ReactComponent as BrandLogo } from 'assets/svg/brand.logo.svg';
import { ReactComponent as Chevron } from 'assets/svg/chevron.up.svg';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom'
import useAuth from 'contexts/auth/useAuth';

interface Props {};

const NavBar = (props: Props) => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { isSignedIn, signIn, signOut } = useAuth();
  const [open, setOpen] = useState(false);
  return (
    <HStack backgroundColor="brand.secondaryBG" width="100%" justifyContent="space-between" padding="10px" borderBottom="1px solid" borderColor="brand.secondaryStroke">
      <HStack>
        <Link as={rLink} _hover={{textDecoration: "none"}} to="/home"><Text fontSize="xl">Meet</Text></Link>
      </HStack>
      <HStack spacing="30px">
        <Link as={rLink} _hover={{textDecoration: "none"}} to="/meetups"><Text fontSize="sm">Meetups</Text></Link>
        <Link as={rLink} _hover={{textDecoration: "none"}} to="/housing"><Text fontSize="sm">Housing</Text></Link>
        <HStack position="relative" spacing="2px">
          <Button backgroundColor="brand.primary" height="35px" paddingX="30px" fontSize="sm" _hover={{bg: "brand.primaryLight"}} borderRightRadius={0} borderBottomLeftRadius={open ? 0 : 8}>Account</Button>
          <Button backgroundColor="brand.primary" height="35px" paddingX="0px" _hover={{bg: "brand.primaryLight"}} borderLeftRadius={0} borderBottomRightRadius={open ? 0 : 8} onClick={() => setOpen(prev => !prev)}>
            <Chevron fill="white" width="15px" style={{ transform: `rotate(${open ? '180deg' : '0'})`}}/>
          </Button>
          {open &&
            <Stack onMouseLeave={() => setOpen(false)} zIndex={999} backgroundColor={"brand.primary"} minW="100%" borderBottomRadius="8px" position="absolute" top="calc(2px + 100%)" right="0" spacing={0}>
              <Button fontSize="sm" width="100%" justifyContent="end" paddingLeft="20px" bg="none" borderRadius={0}>Company</Button>
              <Button fontSize="sm" width="100%" justifyContent="end" paddingLeft="20px" bg="none" borderRadius={0}>Settings</Button>
              <Button onClick={isSignedIn ? signOut : () => navigate("/login")} fontSize="sm" width="100%" justifyContent="end" paddingLeft="20px" bg="none" borderRadius={0}>{isSignedIn? "Sign Out" : "Sign In"}</Button>
            </Stack>
          }
        </HStack>
      </HStack>
    </HStack>
  )
};

export default NavBar;
