__ZNK30HGAppleLogLinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000114a60	pushq	%rbp
0000000000114a61	movq	%rsp, %rbp
0000000000114a64	pushq	%rbx
0000000000114a65	pushq	%rax
0000000000114a66	testq	%rsi, %rsi
0000000000114a69	je	0x114a9f
0000000000114a6b	movq	%rdi, %rbx
0000000000114a6e	movq	0x8ed86b(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000114a75	leaq	__ZTI30HGAppleLogLinearizationLUTInfo(%rip), %rdx ## typeinfo for HGAppleLogLinearizationLUTInfo
0000000000114a7c	movq	%rsi, %rdi
0000000000114a7f	movq	%rax, %rsi
0000000000114a82	xorl	%ecx, %ecx
0000000000114a84	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000114a89	testq	%rax, %rax
0000000000114a8c	je	0x114a9f
0000000000114a8e	movq	%rbx, %rdi
0000000000114a91	movq	%rax, %rsi
0000000000114a94	addq	$0x8, %rsp
0000000000114a98	popq	%rbx
0000000000114a99	popq	%rbp
0000000000114a9a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
0000000000114a9f	xorl	%eax, %eax
0000000000114aa1	addq	$0x8, %rsp
0000000000114aa5	popq	%rbx
0000000000114aa6	popq	%rbp
0000000000114aa7	retq
0000000000114aa8	nopl	(%rax,%rax)
