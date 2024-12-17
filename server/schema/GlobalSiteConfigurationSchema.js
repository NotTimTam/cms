import { listLimitOptions } from "@/util/data";
import mongoose from "mongoose";

// {
//     "site": {
//       "metadata": {
//         "robots": "noindex, follow",
//         "showCMSVersion": true,
//         "showAuthorMetaTag": true,
//         "author": "a",
//         "description": "a",
//         "keywords": "a"
//       },
//     },
//     "server": {
//       "cache": {
//         "use": true,
//         "path": "/cache2"
//       },
//       "temp": "/tmp2",
//       "webServices": {
//         "cors": true,
//         "rateLimiter": {
//           "use": true,
//           "interval": "60001",
//           "requests": "6"
//         }
//       }
//     },
//     "permissions": [
//       {
//         "userRoleId": "675dcd5d65fd3606f64e2a2e",
//         "permissions": [
//           {
//             "name": "permissions",
//             "status": false
//           }
//         ]
//       },
//       {
//         "userRoleId": "675dcdf665fd3606f64e2ac6",
//         "permissions": [
//           {
//             "name": "adminLogin",
//             "status": true
//           },
//           {
//             "name": "delete",
//             "status": false
//           },
//           {
//             "name": "edit",
//             "status": null
//           }
//         ]
//       },
//       {
//         "userRoleId": "675dcdea65fd3606f64e2aaf",
//         "permissions": [
//           {
//             "name": "delete",
//             "status": true
//           }
//         ]
//       }
//     ],
//   }

const GlobalSiteConfigurationSchema = new mongoose.Schema(
	{
		name: {
			type: String,
			required: true,
			maxLength: [256, "Maximum site name length is 256 characters."],
			minLength: [1, "Minimum site name length is 1 character."],
		},
		metadata: {},
		offline: {
			type: Boolean,
			required: false,
			default: false,
		},
	},
	{ _id: false }
);

export default GlobalSiteConfigurationSchema;
