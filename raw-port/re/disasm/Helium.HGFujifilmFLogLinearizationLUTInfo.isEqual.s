__ZNK34HGFujifilmFLogLinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000114db0	pushq	%rbp
0000000000114db1	movq	%rsp, %rbp
0000000000114db4	pushq	%rbx
0000000000114db5	pushq	%rax
0000000000114db6	testq	%rsi, %rsi
0000000000114db9	je	0x114def
0000000000114dbb	movq	%rdi, %rbx
0000000000114dbe	movq	0x8ed51b(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000114dc5	leaq	__ZTI34HGFujifilmFLogLinearizationLUTInfo(%rip), %rdx ## typeinfo for HGFujifilmFLogLinearizationLUTInfo
0000000000114dcc	movq	%rsi, %rdi
0000000000114dcf	movq	%rax, %rsi
0000000000114dd2	xorl	%ecx, %ecx
0000000000114dd4	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000114dd9	testq	%rax, %rax
0000000000114ddc	je	0x114def
0000000000114dde	movq	%rbx, %rdi
0000000000114de1	movq	%rax, %rsi
0000000000114de4	addq	$0x8, %rsp
0000000000114de8	popq	%rbx
0000000000114de9	popq	%rbp
0000000000114dea	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
0000000000114def	xorl	%eax, %eax
0000000000114df1	addq	$0x8, %rsp
0000000000114df5	popq	%rbx
0000000000114df6	popq	%rbp
0000000000114df7	retq
0000000000114df8	nopl	(%rax,%rax)
