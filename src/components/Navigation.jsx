import React, {useState, useRef} from "react";
import { Link as ReactRouterLink, useNavigate } from "react-router-dom";
import { useToast } from '@chakra-ui/react'
import { useQuery } from "@tanstack/react-query";
import {
  Text,
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  Icon,
  HStack,
  Input,
  Button,
} from "@chakra-ui/react";
import { GrUpload, GrAdd } from "react-icons/gr";
import { HiHome } from "react-icons/hi";

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

export default function Navigation({ prefix }) {
  const navigate = useNavigate();
  const toast = useToast()

  const {refetch} = useQuery(["bucketObjects", prefix], () => listBucketObjects(prefix))

  const fileInputRef = useRef();

  const [newFolder, setNewFolder] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)

  const handleFolderChange = (event) => setNewFolder(event.target.value)

  const handleNewFolder = () => {
    let newPath = `/?prefix=${prefix}${newFolder}/`
    setNewFolder("")
    navigate(newPath)
  }

  const handleUpload = (e, prefix) => {
    setIsProcessing(true)
    e.preventDefault();
    let file = e.target.files[0];
    let fileName = file.name
  
    let formData = new FormData();
    formData.append("file", file);
  
    fetch(`http://localhost:8000/object?path=${btoa(toBinaryStr(prefix))}`, {
      method: "POST",
      body: formData,
    })
      .then((resp) => resp.json())
      .then(() => {
        setIsProcessing(false)
        toast({
          title: `${fileName} uploaded.`,
          description: "Your file has been uploaded successfully.",
          status: 'info',
          duration: 3000,
          isClosable: true,
        })
        refetch()
      });
  };

  const folders = prefix
    .split("/")
    .slice(0, -1)
    .map((item, index, items) => ({
      name: `${item}`,
      url: `/?prefix=${items.slice(0, index + 1).join("/")}/`,
      isCurrent: index == items.length - 1,
    }));

  return (
  <HStack height="8vh" mt={3} spacing={5} p={5} background="black">
    <Breadcrumb
      spacing={2}
      alignContent="center"
    >
        <BreadcrumbItem color="white" key="root" isCurrentPage={folders.length == 0}>
        {folders.length == 0 ? (
          <HStack align="">
            <Icon as={HiHome} boxSize={6} />
            <Text>
            Home
          </Text>
          </HStack>
        ) : (
          <BreadcrumbLink as={ReactRouterLink} to="" aria-label="bucket root">
            <Icon as={HiHome} boxSize={6} />
          </BreadcrumbLink>
        )}
        </BreadcrumbItem>
      {folders.map((item) => (
        <BreadcrumbItem color="white" key={item.url} isCurrentPage={item.isCurrent}>
          {item.isCurrent ? (
            <Text color="">{item.name}</Text>
          ) : (
            <BreadcrumbLink as={ReactRouterLink} to={item.url}>
              {item.name}
            </BreadcrumbLink>
          )}
        </BreadcrumbItem>
      ))}
    </Breadcrumb>
    <Button leftIcon={<GrAdd />} colorScheme='teal' size="sm" onClick={handleNewFolder}>New Folder</Button>
    <Input value={newFolder} width='auto' size="sm" placeholder='New Folder Name'  color="white" onChange={handleFolderChange}/>
    <Button isLoading={isProcessing} loadingText='uploading' leftIcon={<GrUpload />} colorScheme='blue' size="sm" onClick={()=>fileInputRef.current.click()}>Upload</Button>
    <input onChange={(e) => handleUpload(e, prefix)} multiple={false} ref={fileInputRef} type='file' hidden/>
    </HStack>
  );
}
