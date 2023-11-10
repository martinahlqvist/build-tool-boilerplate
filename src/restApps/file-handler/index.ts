// Importerar från Sitevision 
import router from "@sitevision/api/common/router";
import fileUtil from "@sitevision/api/server/FileUtil";
import nodeTreeUtil from "@sitevision/api/server/NodeTreeUtil";
import appData from "@sitevision/api/server/appData";
import properties from "@sitevision/api/server/Properties";
import folderUtil from "@sitevision/api/server/FolderUtil";

import logUtil from "@sitevision/api/server/LogUtil";

// Importerar typer
import type { Node } from "@sitevision/api/types/javax/jcr/Node";
import type { Item } from "@sitevision/api/types/javax/jcr/Item";

// Egna typer
export interface IUploadContent {
  uri: string;
  name: string;
}
export interface IResult {
  message: string | unknown;
  success: boolean;
}

/**
 * Kollar om en folder finns, om inte skapar den och retunerar noden för den
 * @param targetFolderNode {Node} Node (sv:node) till foldern som mappen ska finnas i
 * @param folderName {string} Namnet (sting) på mappen som ska finnas
 * @returns null om folder inte finns, noden om den finns
 */
function checkForFolder(targetFolderNode: Node, folderName: string): Node {
  let folderNode: Node = nodeTreeUtil.getNode(targetFolderNode, folderName);

  if (folderNode === null) {
    folderNode = folderUtil.createFolder(targetFolderNode, folderName);
  }

  return folderNode;
}

/**
 * Laddar upp en fil från en extern url till en mapp i filarkivet
 * @param targetFolderNode {Node} Node (sv:node) till foldern som filen ska laddas upp till
 * @param uploadContent {IUploadContent} Objekt med namn (name) och url (uri) till filen som ska laddas upp
 * @returns Ett objekt med meddelande (message) och status (success) boolean
 */
function uploadFileFromUri(targetFolderNode: Node, uploadContent: IUploadContent) {
  const result: IResult = {
    "message": "no action",
    "success": false
  };

  let fileNode: Node | null;

  try {
    fileNode = nodeTreeUtil.getNode(targetFolderNode, uploadContent.name);
  } catch (e) {
    fileNode = null;
  }

  if (fileNode === null) {
    try {
      fileNode = fileUtil.createFile(targetFolderNode, uploadContent.name, uploadContent.uri);
      result.message = "New file created";
      result.success = true;
    } catch (e) {
      result.message = e;
    }
  } else {
    try {
      fileUtil.updateBinaryContent(fileNode, uploadContent.uri);
      result.message = "File updated";
      result.success = true;
    } catch (e) {
      result.message = e;
    }
  }

  return result;
}

/**
 * Laddar upp en fil från bifogad fil till en mapp i filarkivet
 * @param targetFolderNode {Node} Node till foldern som filen ska laddas upp till
 * @param tempFile {Node} Filen (sv:temporaryFile)
 * @returns Ett objekt med meddelande (message) och status (success) boolean
 */
function uploadFileFromTemp(targetFolderNode: Node, tempFile: Node | Item | null) {
  const result: IResult = {
    "message": "no action",
    "success": false
  };

  //logUtil.info("uploadFileFromTemp targetFolderNode: " + targetFolderNode);

  const fileName = "" + properties.get(tempFile, "fileName");

  //logUtil.info("Kollar om " + fileName + " redan finns");

  let fileNode: Node | null;

  try {
    fileNode = nodeTreeUtil.getNode(targetFolderNode, fileName);
  } catch (e) {
    fileNode = null;
  }

  //logUtil.info("fileNode: " + fileNode);

  if (fileNode === null) {
    try {
     // fileUtil.createFileFromTemporary(targetFolderNode, tempFile);
      result.message = "New file created";
      result.success = true;
    } catch (e) {
      result.message = e;
    }
  } else {
    try {
      //fileUtil.updateBinaryContentFromTemporary(fileNode, tempFile);
      result.message = "File updated";
      result.success = true;
    } catch (e) {
      result.message = e;
    }
  }

  return result;
}

/**
 * Router för att ladda upp en fil från en extern url till en mapp i filarkivet
 */
router.post("/createFileFromUri", (req, res) => {

  const targetFolderNode: Node = appData.getNode('targetFolder');
  const fileName = req.params.fileName;
  const fileUri = req.params.fileUri;
  const subFolder = req.params.subFolder;

  let result: IResult = {
    "message": "no action",
    "success": false
  };

  if (!fileName || !fileUri) {
    result = {
      "message": "Missing parameters",
      "success": false
    };
  } else {

    if (subFolder) {
      const subFolderNode = checkForFolder(targetFolderNode, subFolder);
      result = uploadFileFromUri(subFolderNode, { name: fileName, uri: fileUri });
    } else {
      result = uploadFileFromUri(targetFolderNode, { name: fileName, uri: fileUri });
    }
  }

  res.json(result);
});

/**
 * Router för att ladda upp en fil från bifogad fil till en mapp i filarkivet
 */
router.post("/createFileFromTemp", (req, res) => {
  let result: IResult = {
    "message": "no action",
    "success": false
  };

  //logUtil.info("Route Post createFileFromTemp");

  //logUtil.info("req.params: " + JSON.stringify(req.params));

  const targetFolderNode: Node = appData.getNode('targetFolder');

  
  const file = req.file;
 
  //logUtil.info(JSON.stringify(req, null, 2));

  let subFolder = null;
  try {
    subFolder = req.params.subFolder;
  } catch (e) {
    subFolder = null;
  }


  //logUtil.info("subFolder = " + subFolder);


  //if(file !== null) {

  if (subFolder) {
    const subFolderNode = checkForFolder(targetFolderNode, subFolder);
    try {

     // result = uploadFileFromTemp(subFolderNode, req.file);
    } catch (e) {
      result = {
        "message": e,
        "success": false
      };
    }
  } else {

    try {
     // result = uploadFileFromTemp(targetFolderNode, file);
    } catch (e) {
      result = {
        "message": e,
        "success": false
      };
    }
  }
/*} else {
  result = {
    "message": "No file : " + JSON.stringify(req),
    "success": false
  };
} */


  res.json(result);
});