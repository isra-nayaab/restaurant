// src/pages/CustomerMenu.tsx
// src/pages/CustomerMenu.tsx
import { useEffect, useState } from "react";
import {
  Box,
  Flex,
  VStack,
  HStack,
  Image,
  Text,
  Button,
  Spinner,
} from "@chakra-ui/react";
import { supabase } from "../supabase";
import { useCart } from "../context/CartContext";
import Header from "./Header";

export interface MenuItem {
  id: number;
  name: string;
  price: number;
  image_url: string;
  position: number;
  is_available: boolean;
}

interface Category {
  id: number;
  name: string;
  position: number;
  menu_item: MenuItem[];
}

export default function CustomerMenu() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCat, setSelectedCat] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { cart, addItem, removeItem } = useCart();

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("category")
        .select(`
          id,
          name,
          position,
          menu_item (
            id,
            name,
            price,
            image_url,
            position,
            is_available
          )
        `)
        .order("position", { ascending: true })
        .order("position", { referencedTable: "menu_item", ascending: true });

      if (error) {
        console.error(error);
        setLoading(false);
        return;
      }

      const filtered = data?.filter(
        (cat) => cat.menu_item && cat.menu_item.length > 0
      );

      setCategories(filtered ?? []);
      setSelectedCat(filtered?.[0]?.id ?? null);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) return <Spinner />;

  const activeCategory = categories.find((c) => c.id === selectedCat);

  const getUrl = (item: MenuItem) =>
    supabase.storage.from("isra-cafe").getPublicUrl(item.image_url).data
      .publicUrl;

  return (
    <>
      <Header />

      <Flex
        h="100vh"
        overflow="hidden"
        bgGradient="linear(to-r, #be9c7bff, #a7906eff)" // warm creamy gradient
      >
        {/* Sidebar */}
        <VStack
          w="220px"
          bgGradient="linear(to-b, #7c6b57ff, #aa917dff)"  // deep warm -brown
          p={4}
          spacing={3}
          align="stretch"
          overflowY="auto"
          color="white"
          shadow="xl"
        >
          {categories.map((cat) => (
            <Button
              key={cat.id}
              variant={cat.id === selectedCat ? "solid" : "ghost"}
              bg={cat.id === selectedCat ? "whiteAlpha.300" : "transparent"}
              _hover={{ bg: "whiteAlpha.200", transform: "scale(1.05)" }}
              justifyContent="flex-start"
              rounded="lg"
              transition="all 0.2s"
              onClick={() => setSelectedCat(cat.id)}
            >
              {cat.name}
            </Button>
          ))}
        </VStack>

        {/* Main content */}
        <Box
          flex="1"
          p={6}
          overflowY="auto"
          bg="#fffaf0"                               // soft off-white background
        >
          <Text fontSize="3xl" mb={6} fontWeight="bold" color="brown.800">
            {activeCategory?.name}
          </Text>

          <Flex wrap="wrap" gap={6}>
            {activeCategory?.menu_item.map((item) => {
              const count = cart[item.id]?.quantity || 0;
              return (
                <Box
                  key={item.id}
                  w="220px"
                  borderWidth="1px"
                  borderRadius="xl"
                  overflow="hidden"
                  shadow="md"
                  bg="white"
                  _hover={{ shadow: "xl", transform: "translateY(-4px)" }}
                  transition="all 0.2s"
                >
                  <Image
                    src={getUrl(item)}
                    alt={item.name}
                    w="100%"
                    h="150px"
                    objectFit="cover"
                  />
                  <Box p={4}>
                    <Text fontWeight="semibold" fontSize="lg" color="brown.700">
                      {item.name}
                    </Text>
                    <Text color="gray.600">₹{item.price}</Text>

                    <HStack mt={3}>
                      <Button
                        size="sm"
                        colorScheme="brown"
                        variant="outline"
                        onClick={() => removeItem(item)}
                      >
                        –
                      </Button>
                      <Text>{count}</Text>
                      <Button
                        size="sm"
                        colorScheme="brown"
                        variant="outline"
                        onClick={() => addItem(item)}
                      >
                        +
                      </Button>
                    </HStack>
                  </Box>
                </Box>
              );
            })}
          </Flex>
        </Box>
      </Flex>
    </>
  );
}
