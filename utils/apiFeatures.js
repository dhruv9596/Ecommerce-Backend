class ApiFeatures{
    constructor( query , queryStr ) {
        this.query = query;
        this.queryStr = queryStr;
        
    }
    //why "i"? If keywords is in capital then it'll also look for small abc.
    //case insensitive
    search() {
        const keyword = this.queryStr.keyword
        ? { name: {$regex: this.queryStr.keyword, $options: 'i',}, }
        : {};
        this.query = this.query.find({ ...keyword });
        return this;
    }

    filter() {
        //This is ref copy changes also done on the queryStr
        //const queryCopy = this.queryStr
        //instaed of that make different copy
        const queryCopy = { ...this.queryStr };
        //console.log(queryCopy);
        //Removing some fields for category
        const removeFields = ["keyword","page","limit"];
        removeFields.forEach( key => delete queryCopy[key] );

        //Filter for Price and Rating

        //console.log(queryCopy);

        //queryCopy is an Obj converting it to a string using stringify
        let queryStr = JSON.stringify(queryCopy);
        //  /\this is for reg expr
        //$$ to use gt as $regex as used in prev expr.
        queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g , key => `$${key}`);
        //again convert to JSON obj
        this.query = this.query.find(JSON.parse(queryStr));
        //console.log(queryStr);

        return this;
    }

    pagination( resultPerPage){
        const currentPage = Number(this.queryStr.page) || 1; 
        const skip = resultPerPage * ( currentPage - 1 );
        this.query = this.query.limit(resultPerPage).skip(skip);
        return this;
    }

};

module.exports = ApiFeatures;