__ZN4HGLC11getContextsEv:
00000000001acb00	movq	__ZZN4HGLC11getContextsEvE8contexts(%rip), %rax ## HGLC::getContexts()::contexts
00000000001acb07	testq	%rax, %rax
00000000001acb0a	je	0x1acb0d
00000000001acb0c	retq
00000000001acb0d	pushq	%rbp
00000000001acb0e	movq	%rsp, %rbp
00000000001acb11	movl	$0x18, %edi
00000000001acb16	callq	0x3c4fb2                        ## symbol stub for: __Znwm
00000000001acb1b	leaq	0x8(%rax), %rcx
00000000001acb1f	xorps	%xmm0, %xmm0
00000000001acb22	movups	%xmm0, 0x8(%rax)
00000000001acb26	movq	%rcx, (%rax)
00000000001acb29	movq	%rax, __ZZN4HGLC11getContextsEvE8contexts(%rip) ## HGLC::getContexts()::contexts
00000000001acb30	popq	%rbp
00000000001acb31	retq
00000000001acb32	nopw	%cs:(%rax,%rax)
