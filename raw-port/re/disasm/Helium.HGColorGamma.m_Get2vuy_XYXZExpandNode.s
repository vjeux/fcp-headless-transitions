__ZN12HGColorGamma24m_Get2vuy_XYXZExpandNodeEv:
00000000000f9530	pushq	%rbp
00000000000f9531	movq	%rsp, %rbp
00000000000f9534	pushq	%r15
00000000000f9536	pushq	%r14
00000000000f9538	pushq	%rbx
00000000000f9539	pushq	%rax
00000000000f953a	movq	0x1e0(%rdi), %rax
00000000000f9541	testq	%rax, %rax
00000000000f9544	jne	0xf9582
00000000000f9546	movq	%rdi, %r15
00000000000f9549	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f954e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f9553	movq	%rax, %r14
00000000000f9556	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f955b	movq	%rax, %rdi
00000000000f955e	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f9563	movq	%r14, %rbx
00000000000f9566	movq	%r14, %rdi
00000000000f9569	callq	__ZN30HgcColorGamma_2vuy_xyxz_expandC2Ev ## HgcColorGamma_2vuy_xyxz_expand::HgcColorGamma_2vuy_xyxz_expand()
00000000000f956e	leaq	0x91a433(%rip), %rcx
00000000000f9575	movq	%rbx, %rax
00000000000f9578	movq	%rcx, (%rbx)
00000000000f957b	movq	%rbx, 0x1e0(%r15)
00000000000f9582	addq	$0x8, %rsp
00000000000f9586	popq	%rbx
00000000000f9587	popq	%r14
00000000000f9589	popq	%r15
00000000000f958b	popq	%rbp
00000000000f958c	retq
00000000000f958d	movq	%rax, %r14
00000000000f9590	movq	%rbx, %rdi
00000000000f9593	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f9598	movq	%r14, %rdi
00000000000f959b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
