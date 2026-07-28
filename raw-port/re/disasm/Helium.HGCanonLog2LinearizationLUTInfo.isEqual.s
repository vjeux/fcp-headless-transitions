__ZNK31HGCanonLog2LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000113cd0	pushq	%rbp
0000000000113cd1	movq	%rsp, %rbp
0000000000113cd4	pushq	%rbx
0000000000113cd5	pushq	%rax
0000000000113cd6	testq	%rsi, %rsi
0000000000113cd9	je	0x113d0f
0000000000113cdb	movq	%rdi, %rbx
0000000000113cde	movq	0x8ee5fb(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000113ce5	leaq	__ZTI31HGCanonLog2LinearizationLUTInfo(%rip), %rdx ## typeinfo for HGCanonLog2LinearizationLUTInfo
0000000000113cec	movq	%rsi, %rdi
0000000000113cef	movq	%rax, %rsi
0000000000113cf2	xorl	%ecx, %ecx
0000000000113cf4	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000113cf9	testq	%rax, %rax
0000000000113cfc	je	0x113d0f
0000000000113cfe	movq	%rbx, %rdi
0000000000113d01	movq	%rax, %rsi
0000000000113d04	addq	$0x8, %rsp
0000000000113d08	popq	%rbx
0000000000113d09	popq	%rbp
0000000000113d0a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
0000000000113d0f	xorl	%eax, %eax
0000000000113d11	addq	$0x8, %rsp
0000000000113d15	popq	%rbx
0000000000113d16	popq	%rbp
0000000000113d17	retq
0000000000113d18	nopl	(%rax,%rax)
