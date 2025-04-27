import React, {useState, useRef} from "react";
import { useQuery } from "@tanstack/react-query";
import { useToast } from '@chakra-ui/react'
import { Link as ReactRouterLink } from "react-router-dom";
import {
  Box,
  Text,
  Link,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Spinner,
  Icon,
  Button,
  HStack,
  useDisclosure,
  AlertDialog,
  AlertDialogBody,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogOverlay,
} from "@chakra-ui/react";

import { HiFolder, HiDocument } from "react-icons/hi";

function toBinaryStr(str) {
  const encoder = new TextEncoder();
  // 1: split the UTF-16 string into an array of bytes
  const charCodes = encoder.encode(str);
  // 2: concatenate byte data to create a binary string
  return String.fromCharCode(...charCodes);
}

const listBucketObjects = async (prefix) => {
  const result = await fetch(
    `http://localhost:8000/objects?prefix=${btoa(toBinaryStr(prefix))}`
  );
  return result.json();
};

export default function ObjectsList({ prefix }) {
  const toast = useToast()
  const { isOpen, onOpen, onClose } = useDisclosure()
  const cancelRef = useRef()

  const {data, status, refetch} = useQuery(["bucketObjects", prefix], () => listBucketObjects(prefix))

  const [downloadingObject, setDownloadingObject] = useState(null)
  const [deletingObject, setDeletinggObject] = useState(null)

  const [isDeleting, setIsDeleting] = useState(false)

  const handleDownload = (filePath, index) => {
    setDownloadingObject(index)
    let filename = ''
    fetch(`http://localhost:8000/object?path=${btoa(toBinaryStr(filePath))}`)
    .then(res => {
        const disposition = res.headers.get('Content-Disposition');
        filename = disposition.split(/;(.+)/)[1].split(/=(.+)/)[1];
        if (filename.toLowerCase().startsWith("utf-8''"))
            filename = decodeURIComponent(filename.replace("utf-8''", ''));
        else
            filename = filename.replace(/['"]/g, '');
        return res.blob();
    })
    .then(blob => {
        var url = window.URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = filename;
        document.body.appendChild(a); // append the element to the dom
        a.click();
        a.remove(); // afterwards, remove the element
        setDownloadingObject(null)
    });
  };

  const handleDelete = (filePath) => {
    fetch(`http://localhost:8000/object?path=${btoa(toBinaryStr(filePath))}`, {method: "DELETE",})
    .then((response) => {
      if (response.ok) {
        return response.json();
      }
        return response.json().then(text => { throw new Error(text.detail) })
      })
      .then(() => {
        toast({
          title: `Object deleted`,
          description: `Object ${filePath} was deleted successfully from bucket.`,
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        setDeletinggObject(null)
        onClose()
        refetch()
      })
      .catch((error) => {
        toast({
          title: `Server error.`,
          description: `could not delete ${filePath}. ${error}`,
          status: 'error',
          duration: 5000,
          isClosable: true,
        })
        setDeletinggObject(null)
        onClose()
        refetch()
      });

  };

  const handleOpenDialog = (objectPath) => {
    setDeletinggObject(objectPath);
    onOpen()
  }

  return (
    <>
      <Box background="black">
        <Table variant="simple">
          <Thead background="black">
            <Tr>
              <Th color="white">Name</Th>
              <Th color="white">Last modified</Th>
              <Th color="white">Size</Th>
              <Th color="white">Actions</Th>
            </Tr>
          </Thead>
          <Tbody>
            {(() => {
              switch (status) {
                case "loading":
                  return (
                    <Tr color="white">
                      <Td colSpan={5} textAlign="center">
                        <Spinner
                          emptyColor="gray.200"
                          verticalAlign="middle"
                          mr={1}
                        />
                        Loading...
                      </Td>
                    </Tr>
                  );
                case "error":
                  return (
                    <Tr color="white">
                      <Td colSpan={5} textAlign="center">
                        Failed to fetch data
                      </Td>
                    </Tr>
                  );
                case "success":
                  return (
                    <>
                      {data?.folders.map((item) => (
                        <Tr color="white" key={item.path}>
                          <Td>
                            <HStack>
                              <Icon
                              as={HiFolder}
                              boxSize={6}
                              color="#05EA7D"
                            />
                            <Link as={ReactRouterLink} to={item.url} color="white">
                              {item.name}
                            </Link>
                            </HStack>
                          </Td>
                          <Td>–</Td>
                          <Td>{item.size}</Td>
                          <Td>
                          <HStack>
                          <Button size="sm" colorScheme='red' onClick={() => handleOpenDialog(item.path)}>Delete</Button>
                          </HStack>
                          </Td>
                        </Tr>
                      ))}
                      {data?.files.map((item, index) => (
                        <Tr color="white" key={item.path}>
                          <Td>
                          <HStack>
                          <Icon
                              as={HiDocument}
                              color="#05EA7D"
                              boxSize={6}
                            />
                            <Text>
                            {item.key}
                            </Text>
                          </HStack>
                          </Td>
                          <Td>{item.last_modified.toLocaleString()}</Td>
                          <Td>{item.size}</Td>
                          <Td>
                            <HStack>
                            <Button loadingText="deleting" size="sm" colorScheme='red' onClick={() => handleOpenDialog(item.path)}>Delete</Button>
                              <Button isLoading={downloadingObject == index} loadingText="downloading" size="sm" colorScheme='green' onClick={() => handleDownload(item.path, index)}>Download</Button>
                            </HStack>
                          </Td>
                        </Tr>
                      ))}
                    </>
                  );
              }
            })()}
          </Tbody>
        </Table>
      </Box>
      <AlertDialog
        isOpen={isOpen}
        leastDestructiveRef={cancelRef}
        onClose={onClose}
      >
      <AlertDialogOverlay>
          <AlertDialogContent>
            <AlertDialogHeader fontSize='lg' fontWeight='bold'>
              Delete Object
            </AlertDialogHeader>

            <AlertDialogBody>
              Are you sure? You can't undo this action afterwards. Object path at {deletingObject}
            </AlertDialogBody>

            <AlertDialogFooter>
              <Button ref={cancelRef} onClick={onClose}>
                Cancel
              </Button>

              <Button colorScheme='red' onClick={() => handleDelete(deletingObject)} ml={3}>
                Delete
              </Button>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialogOverlay>
      </AlertDialog>
    </>
  );
}
