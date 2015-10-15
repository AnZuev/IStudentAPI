Array.prototype.intersectSortArr = function (A,B){
    var M = A.length, N = B.length, C = [],
        m = 1, n = 1, k = 0, a = 0, b = 0;
    for (var i = 1, t = A[0]; i < M; i++)
    {
        if (A[i] !== t)
        {
            A[m++] = A[i]; t = A[i];
        }
    }

    for ( i = 1, t = B[0]; i < N; i++)
    {
        if (B[i] !== t){
            B[n++] = B[i]; t = B[i];
        }
    }

    while (a < m && b < n)
    {
        if (A[a] < B[b]) ++a;
        else if (A[a] > B[b]) ++b;
        else C[k++] = A[a++];
    }
    return C;
}

Array.prototype.diffSortArr = function (A,B){
    var C = intersecSortArr(A,B),
        M = A.length,
        N = C.length;

    for (var i=0, k=0, a=0, c=0; i<M+N; i++)
    {
        if (A[a] === C[c]){
            ++a; ++c;
        }
        else{
            A[k] = A[i];
            k++; a++;
        }
    }
    A.length = k;
    return A;
}

exports.Array = Array;