__ZNK35HGFujifilmFLog2LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000114f50	pushq	%rbp
0000000000114f51	movq	%rsp, %rbp
0000000000114f54	pushq	%rbx
0000000000114f55	pushq	%rax
0000000000114f56	testq	%rsi, %rsi
0000000000114f59	je	0x114f8f
0000000000114f5b	movq	%rdi, %rbx
0000000000114f5e	movq	0x8ed37b(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000114f65	leaq	__ZTI35HGFujifilmFLog2LinearizationLUTInfo(%rip), %rdx ## typeinfo for HGFujifilmFLog2LinearizationLUTInfo
0000000000114f6c	movq	%rsi, %rdi
0000000000114f6f	movq	%rax, %rsi
0000000000114f72	xorl	%ecx, %ecx
0000000000114f74	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000114f79	testq	%rax, %rax
0000000000114f7c	je	0x114f8f
0000000000114f7e	movq	%rbx, %rdi
0000000000114f81	movq	%rax, %rsi
0000000000114f84	addq	$0x8, %rsp
0000000000114f88	popq	%rbx
0000000000114f89	popq	%rbp
0000000000114f8a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
0000000000114f8f	xorl	%eax, %eax
0000000000114f91	addq	$0x8, %rsp
0000000000114f95	popq	%rbx
0000000000114f96	popq	%rbp
0000000000114f97	retq
0000000000114f98	nopl	(%rax,%rax)
