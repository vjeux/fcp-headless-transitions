__ZN10HGGamutMap13SetConversionEN12HGColorGamma26hgColorGammaColorPrimariesENS0_28hgColorGammaTransferFunctionENS0_30hgColorGammaMatrixCoefficientsES1_S2_S3_:
0000000000157650	pushq	%rbp
0000000000157651	movq	%rsp, %rbp
0000000000157654	pushq	%rbx
0000000000157655	pushq	%rax
0000000000157656	movq	%rdi, %rbx
0000000000157659	movl	0x10(%rbp), %eax
000000000015765c	movl	$0x1, 0x1a8(%rdi)
0000000000157666	movl	%esi, 0x1ac(%rdi)
000000000015766c	movl	%edx, 0x1b4(%rdi)
0000000000157672	movl	%ecx, 0x1bc(%rdi)
0000000000157678	movl	%r8d, 0x1b0(%rdi)
000000000015767f	movl	%r9d, 0x1b8(%rdi)
0000000000157686	movl	%eax, 0x1c0(%rdi)
000000000015768c	movq	0x198(%rdi), %rdi
0000000000157693	callq	0x3c4b98                        ## symbol stub for: _CGColorSpaceRelease
0000000000157698	movq	$0x0, 0x198(%rbx)
00000000001576a3	movq	0x1a0(%rbx), %rdi
00000000001576aa	callq	0x3c4b98                        ## symbol stub for: _CGColorSpaceRelease
00000000001576af	movq	$0x0, 0x1a0(%rbx)
00000000001576ba	addq	$0x8, %rsp
00000000001576be	popq	%rbx
00000000001576bf	popq	%rbp
00000000001576c0	retq
00000000001576c1	nopw	%cs:(%rax,%rax)
