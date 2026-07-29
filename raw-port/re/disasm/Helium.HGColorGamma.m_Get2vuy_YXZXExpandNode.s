00000000000f94c2	movl	%esp, %ebp
00000000000f94c4	pushq	%r15
00000000000f94c6	pushq	%r14
00000000000f94c8	pushq	%rbx
00000000000f94c9	pushq	%rax
00000000000f94ca	movq	0x1d8(%rdi), %rax
00000000000f94d1	testq	%rax, %rax
00000000000f94d4	jne	0xf9512
00000000000f94d6	movq	%rdi, %r15
00000000000f94d9	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f94de	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f94e3	movq	%rax, %r14
00000000000f94e6	movl	$0x1a0, %esi                    ## imm = 0x1A0
00000000000f94eb	movq	%rax, %rdi
00000000000f94ee	callq	0x3c4fca                        ## symbol stub for: ___bzero
00000000000f94f3	movq	%r14, %rbx
00000000000f94f6	movq	%r14, %rdi
00000000000f94f9	callq	__ZN30HgcColorGamma_2vuy_yxzx_expandC2Ev ## HgcColorGamma_2vuy_yxzx_expand::HgcColorGamma_2vuy_yxzx_expand()
00000000000f94fe	leaq	0x91a24b(%rip), %rcx
00000000000f9505	movq	%rbx, %rax
00000000000f9508	movq	%rcx, (%rbx)
00000000000f950b	movq	%rbx, 0x1d8(%r15)
00000000000f9512	addq	$0x8, %rsp
00000000000f9516	popq	%rbx
00000000000f9517	popq	%r14
00000000000f9519	popq	%r15
00000000000f951b	popq	%rbp
00000000000f951c	retq
00000000000f951d	movq	%rax, %r14
00000000000f9520	movq	%rbx, %rdi
00000000000f9523	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f9528	movq	%r14, %rdi
00000000000f952b	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
__ZN12HGColorGamma24m_Get2vuy_XYXZExpandNodeEv:
00000000000f9530	pushq	%rbp
