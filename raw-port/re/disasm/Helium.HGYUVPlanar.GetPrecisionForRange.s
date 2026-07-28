__ZN11HGYUVPlanar20GetPrecisionForRangeENS_10YCbCrRangeEiR22HGFormatPrecisionFlags:
00000000000e49b0	pushq	%rbp
00000000000e49b1	movq	%rsp, %rbp
00000000000e49b4	cmpl	$0x2, %esi
00000000000e49b7	je	0xe49c8
00000000000e49b9	cmpl	$0x6, %edi
00000000000e49bc	ja	0xe49ce
00000000000e49be	movl	$0x76, %eax
00000000000e49c3	btl	%edi, %eax
00000000000e49c6	jae	0xe49ce
00000000000e49c8	movl	$0x8, (%rdx)
00000000000e49ce	popq	%rbp
00000000000e49cf	retq
