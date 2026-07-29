__ZN12HGColorGamma24m_Getv216_YXZXExpandNodeEv:
00000000000f9600	pushq	%rbp
00000000000f9601	movq	%rsp, %rbp
00000000000f9604	pushq	%r15
00000000000f9606	pushq	%r14
00000000000f9608	pushq	%rbx
00000000000f9609	pushq	%rax
00000000000f960a	movq	0x1e8(%rdi), %rax
00000000000f9611	testq	%rax, %rax
00000000000f9614	jne	0xf9652
00000000000f9616	movq	%rdi, %r15
00000000000f9619	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f961e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f9623	movq	%rax, %r14
00000000000f9626	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f962b	movq	%rax, %rdi
00000000000f962e	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f9633	movq	%r14, %rbx
00000000000f9636	movq	%r14, %rdi
00000000000f9639	callq	__ZN30HgcColorGamma_v216_yxzx_expandC2Ev ## HgcColorGamma_v216_yxzx_expand::HgcColorGamma_v216_yxzx_expand()
00000000000f963e	leaq	0x91a813(%rip), %rcx
00000000000f9645	movq	%rbx, %rax
00000000000f9648	movq	%rcx, (%rbx)
00000000000f964b	movq	%rbx, 0x1e8(%r15)
00000000000f9652	addq	$0x8, %rsp
00000000000f9656	popq	%rbx
00000000000f9657	popq	%r14
00000000000f9659	popq	%r15
00000000000f965b	popq	%rbp
00000000000f965c	retq
00000000000f965d	movq	%rax, %r14
00000000000f9660	movq	%rbx, %rdi
00000000000f9663	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f9668	movq	%r14, %rdi
00000000000f966b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
