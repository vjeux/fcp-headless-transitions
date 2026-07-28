__ZNK29HGDJIDLogLinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000114c10	pushq	%rbp
0000000000114c11	movq	%rsp, %rbp
0000000000114c14	pushq	%rbx
0000000000114c15	pushq	%rax
0000000000114c16	testq	%rsi, %rsi
0000000000114c19	je	0x114c4f
0000000000114c1b	movq	%rdi, %rbx
0000000000114c1e	movq	0x8ed6bb(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000114c25	leaq	__ZTI29HGDJIDLogLinearizationLUTInfo(%rip), %rdx ## typeinfo for HGDJIDLogLinearizationLUTInfo
0000000000114c2c	movq	%rsi, %rdi
0000000000114c2f	movq	%rax, %rsi
0000000000114c32	xorl	%ecx, %ecx
0000000000114c34	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000114c39	testq	%rax, %rax
0000000000114c3c	je	0x114c4f
0000000000114c3e	movq	%rbx, %rdi
0000000000114c41	movq	%rax, %rsi
0000000000114c44	addq	$0x8, %rsp
0000000000114c48	popq	%rbx
0000000000114c49	popq	%rbp
0000000000114c4a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
0000000000114c4f	xorl	%eax, %eax
0000000000114c51	addq	$0x8, %rsp
0000000000114c55	popq	%rbx
0000000000114c56	popq	%rbp
0000000000114c57	retq
0000000000114c58	nopl	(%rax,%rax)
