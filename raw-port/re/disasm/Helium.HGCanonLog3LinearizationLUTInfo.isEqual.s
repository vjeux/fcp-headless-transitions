__ZNK31HGCanonLog3LinearizationLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE:
0000000000113e10	pushq	%rbp
0000000000113e11	movq	%rsp, %rbp
0000000000113e14	pushq	%rbx
0000000000113e15	pushq	%rax
0000000000113e16	testq	%rsi, %rsi
0000000000113e19	je	0x113e4f
0000000000113e1b	movq	%rdi, %rbx
0000000000113e1e	movq	0x8ee4bb(%rip), %rax            ## literal pool symbol address: __ZTIN10HGLUTCache7LUTInfoE
0000000000113e25	leaq	__ZTI31HGCanonLog3LinearizationLUTInfo(%rip), %rdx ## typeinfo for HGCanonLog3LinearizationLUTInfo
0000000000113e2c	movq	%rsi, %rdi
0000000000113e2f	movq	%rax, %rsi
0000000000113e32	xorl	%ecx, %ecx
0000000000113e34	callq	0x3c5018                        ## symbol stub for: ___dynamic_cast
0000000000113e39	testq	%rax, %rax
0000000000113e3c	je	0x113e4f
0000000000113e3e	movq	%rbx, %rdi
0000000000113e41	movq	%rax, %rsi
0000000000113e44	addq	$0x8, %rsp
0000000000113e48	popq	%rbx
0000000000113e49	popq	%rbp
0000000000113e4a	jmp	__ZNK16HGApplyNDLUTInfo7isEqualEPN10HGLUTCache7LUTInfoE ## HGApplyNDLUTInfo::isEqual(HGLUTCache::LUTInfo*) const
0000000000113e4f	xorl	%eax, %eax
0000000000113e51	addq	$0x8, %rsp
0000000000113e55	popq	%rbx
0000000000113e56	popq	%rbp
0000000000113e57	retq
0000000000113e58	nopl	(%rax,%rax)
