export namespace app {
	
	export class EmailCredentials {
	    smtpHost: string;
	    smtpPort: string;
	    emailAddress: string;
	    password: string;
	
	    static createFrom(source: any = {}) {
	        return new EmailCredentials(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.smtpHost = source["smtpHost"];
	        this.smtpPort = source["smtpPort"];
	        this.emailAddress = source["emailAddress"];
	        this.password = source["password"];
	    }
	}
	export class FileData {
	    name: string;
	    content: string;
	
	    static createFrom(source: any = {}) {
	        return new FileData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.name = source["name"];
	        this.content = source["content"];
	    }
	}
	export class EmailData {
	    to: string;
	    subject: string;
	    body: string;
	    attachments: FileData[];
	
	    static createFrom(source: any = {}) {
	        return new EmailData(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.to = source["to"];
	        this.subject = source["subject"];
	        this.body = source["body"];
	        this.attachments = this.convertValues(source["attachments"], FileData);
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}
	
	export class SentEmail {
	    to: string;
	    subject: string;
	    // Go type: time
	    timestamp: any;
	    status: string;
	
	    static createFrom(source: any = {}) {
	        return new SentEmail(source);
	    }
	
	    constructor(source: any = {}) {
	        if ('string' === typeof source) source = JSON.parse(source);
	        this.to = source["to"];
	        this.subject = source["subject"];
	        this.timestamp = this.convertValues(source["timestamp"], null);
	        this.status = source["status"];
	    }
	
		convertValues(a: any, classs: any, asMap: boolean = false): any {
		    if (!a) {
		        return a;
		    }
		    if (a.slice && a.map) {
		        return (a as any[]).map(elem => this.convertValues(elem, classs));
		    } else if ("object" === typeof a) {
		        if (asMap) {
		            for (const key of Object.keys(a)) {
		                a[key] = new classs(a[key]);
		            }
		            return a;
		        }
		        return new classs(a);
		    }
		    return a;
		}
	}

}

