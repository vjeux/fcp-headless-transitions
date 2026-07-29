__ZN12HGColorGamma14TestConversionENS_26hgColorGammaColorPrimariesENS_28hgColorGammaTransferFunctionENS_30hgColorGammaMatrixCoefficientsES0_S1_S2_:
00000000000fcdb0	pushq	%rbp
00000000000fcdb1	movq	%rsp, %rbp
00000000000fcdb4	cmpl	$0x8, %r8d
00000000000fcdb8	jne	0xfcdc3
00000000000fcdba	testl	%r9d, %r9d
00000000000fcdbd	je	0xfcddd
00000000000fcdbf	xorl	%eax, %eax
00000000000fcdc1	popq	%rbp
00000000000fcdc2	retq
00000000000fcdc3	cmpl	$0x8, %esi
00000000000fcdc6	jne	0xfcdd0
00000000000fcdc8	testl	%edx, %edx
00000000000fcdca	je	0xfcdf0
00000000000fcdcc	xorl	%eax, %eax
00000000000fcdce	popq	%rbp
00000000000fcdcf	retq
00000000000fcdd0	xorl	%ecx, %edi
00000000000fcdd2	xorl	%r8d, %esi
00000000000fcdd5	orl	%edi, %esi
00000000000fcdd7	je	0xfcdf0
00000000000fcdd9	xorl	%eax, %eax
00000000000fcddb	popq	%rbp
00000000000fcddc	retq
00000000000fcddd	cmpl	$0x8, %esi
00000000000fcde0	sete	%al
00000000000fcde3	testl	%edx, %edx
00000000000fcde5	setne	%cl
00000000000fcde8	testb	%cl, %al
00000000000fcdea	je	0xfcdf0
00000000000fcdec	xorl	%eax, %eax
00000000000fcdee	popq	%rbp
00000000000fcdef	retq
00000000000fcdf0	movb	$0x1, %al
00000000000fcdf2	popq	%rbp
00000000000fcdf3	retq
00000000000fcdf4	nopw	%cs:(%rax,%rax)
