__ZNK31HGNikonNLogLinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000114510	pushq	%rbp
0000000000114511	movq	%rsp, %rbp
0000000000114514	pushq	%rbx
0000000000114515	pushq	%rax
0000000000114516	testq	%rsi, %rsi
0000000000114519	je	0x11454f
000000000011451b	movq	%rdi, %rbx
000000000011451e	movq	0x8eddbb(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000114525	leaq	__ZTI31HGNikonNLogLinearizationLUTInfo(%rip), %rdx ## typeinfo for HGNikonNLogLinearizationLUTInfo
000000000011452c	movq	%rsi, %rdi
000000000011452f	movq	%rax, %rsi
0000000000114532	xorl	%ecx, %ecx
0000000000114534	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000114539	testq	%rax, %rax
000000000011453c	je	0x11454f
000000000011453e	movq	%rbx, %rdi
0000000000114541	movq	%rax, %rsi
0000000000114544	addq	$0x8, %rsp
0000000000114548	popq	%rbx
0000000000114549	popq	%rbp
000000000011454a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
000000000011454f	xorl	%eax, %eax
0000000000114551	addq	$0x8, %rsp
0000000000114555	popq	%rbx
0000000000114556	popq	%rbp
0000000000114557	retq
0000000000114558	nopl	(%rax,%rax)
