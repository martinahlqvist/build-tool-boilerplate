// Import types from Sitevsion API
import router from "@sitevision/api/common/router";
import fileUtil from "@sitevision/api/server/FileUtil";
import nodeTreeUtil from "@sitevision/api/server/NodeTreeUtil";
import appData from "@sitevision/api/server/appData";
import properties from "@sitevision/api/server/Properties";
import folderUtil from "@sitevision/api/server/FolderUtil";

// Import types
import type { Node } from "@sitevision/api/types/javax/jcr/Node";
import type { Item } from "@sitevision/api/types/javax/jcr/Item";

// Own types
export interface IUploadContent {
	uri: string;
	name: string;
}
export interface IResult {
	message: string | unknown;
	success: boolean;
}

/**
 * Check if a folder exists, if not create it and return the node
 * @param targetFolderNode {Node} Node (sv:node) to the folder that is suposed to contain this folder
 * @param folderName {string} Name of this folder
 * @returns null if folder didn't exist/wasn't created or the node of the folder
 */
function checkForFolder(targetFolderNode: Node, folderName: string): Node {
	let folderNode: Node = nodeTreeUtil.getNode(targetFolderNode, folderName);

	if (folderNode === null) {
		folderNode = folderUtil.createFolder(targetFolderNode, folderName);
	}

	return folderNode;
}

/**
 * Uploads a file from an external url to a folder in the file archive
 * @param targetFolderNode {Node} Node (sv:node) of the folder where the file should be uploaded
 * @param uploadContent {IUploadContent} Object with name (name) and url (uri) of the file to be uploaded
 * @returns an object with a message (message) and a status (success) boolean
 */
function uploadFileFromUri(
	targetFolderNode: Node,
	uploadContent: IUploadContent
) {
	const result: IResult = {
		message: "no action",
		success: false,
	};

	let fileNode: Node | null;

	try {
		fileNode = nodeTreeUtil.getNode(targetFolderNode, uploadContent.name);
	} catch (e) {
		fileNode = null;
	}

	if (fileNode === null) {
		try {
			fileNode = fileUtil.createFile(
				targetFolderNode,
				uploadContent.name,
				uploadContent.uri
			);
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
 * Uploads a file from an attached file to a folder in the file archive
 * @param targetFolderNode {Node} Node to the folder where the file should be uploaded
 * @param tempFile {Node} the file (sv:temporaryFile)
 * @returns an object with a message (message) and a status (success) boolean
 */
function uploadFileFromTemp(
	targetFolderNode: Node,
	tempFile: Node | Item | null
) {
	const result: IResult = {
		message: "no action",
		success: false,
	};

	const fileName = "" + properties.get(tempFile, "fileName");
	let fileNode: Node | null;

	try {
		fileNode = nodeTreeUtil.getNode(targetFolderNode, fileName);
	} catch (e) {
		fileNode = null;
	}

	if (fileNode === null) {
		try {
			result.message = "New file created";
			result.success = true;
		} catch (e) {
			result.message = e;
		}
	} else {
		try {
			result.message = "File updated";
			result.success = true;
		} catch (e) {
			result.message = e;
		}
	}

	return result;
}

/**
 * Route for uploading a file from an external url to a folder in the file archive
 */
router.post("/createFileFromUri", (req, res) => {
	const targetFolderNode: Node = appData.getNode("targetFolder");
	const fileName = req.params.fileName;
	const fileUri = req.params.fileUri;
	const subFolder = req.params.subFolder;

	let result: IResult = {
		message: "no action",
		success: false,
	};

	if (!fileName || !fileUri) {
		result = {
			message: "Missing parameters",
			success: false,
		};
	} else {
		if (subFolder) {
			const subFolderNode = checkForFolder(targetFolderNode, subFolder);
			result = uploadFileFromUri(subFolderNode, {
				name: fileName,
				uri: fileUri,
			});
		} else {
			result = uploadFileFromUri(targetFolderNode, {
				name: fileName,
				uri: fileUri,
			});
		}
	}

	res.json(result);
});

/**
 * Route for uploading a file from an attached file to a folder in the file archive
 */
router.post("/createFileFromTemp", (req, res) => {
	let result: IResult = {
		message: "no action",
		success: false,
	};

	const targetFolderNode: Node = appData.getNode("targetFolder");

	const file = req.file as unknown as Item;

	let subFolder = null;
	try {
		subFolder = req.params.subFolder;
	} catch (e) {
		subFolder = null;
	}

	if (subFolder && file !== null) {
		const subFolderNode = checkForFolder(targetFolderNode, subFolder);
		try {
			result = uploadFileFromTemp(subFolderNode, file);
		} catch (e) {
			result = {
				message: e,
				success: false,
			};
		}
	} else {
		try {
			result = uploadFileFromTemp(targetFolderNode, file);
		} catch (e) {
			result = {
				message: e,
				success: false,
			};
		}
	}

	res.json(result);
});
