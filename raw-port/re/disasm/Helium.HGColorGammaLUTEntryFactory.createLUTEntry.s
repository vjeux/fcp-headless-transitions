__ZN27HGColorGammaLUTEntryFactory14createLUTEntryEPN10HGLUTCache7LUTInfoEP10HGRenderer:
00000000000fce10	pushq	%rbp
00000000000fce11	movq	%rsp, %rbp
00000000000fce14	pushq	%r15
00000000000fce16	pushq	%r14
00000000000fce18	pushq	%rbx
00000000000fce19	pushq	%rax
00000000000fce1a	movq	%rdx, %r14
00000000000fce1d	movq	%rsi, %r15
00000000000fce20	movl	$0x28, %edi
00000000000fce25	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000000fce2a	movq	%rax, %rbx
00000000000fce2d	movq	%rax, %rdi
00000000000fce30	movq	%r15, %rsi
00000000000fce33	movq	%r14, %rdx
00000000000fce36	callq	__ZN17HGApplyNDLUTEntryC1EPN10HGLUTCache7LUTInfoEP10HGRenderer ## HGApplyNDLUTEntry::HGApplyNDLUTEntry(HGLUTCache::LUTInfo*, HGRenderer*)
00000000000fce3b	movq	%rbx, %rax
00000000000fce3e	addq	$0x8, %rsp
00000000000fce42	popq	%rbx
00000000000fce43	popq	%r14
00000000000fce45	popq	%r15
00000000000fce47	popq	%rbp
00000000000fce48	retq
00000000000fce49	movq	%rax, %r14
00000000000fce4c	movq	%rbx, %rdi
00000000000fce4f	callq	0x3c4fa0                        ## symbol stub for: __ZdlPv
00000000000fce54	movq	%r14, %rdi
00000000000fce57	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fce5c	nopl	(%rax)
