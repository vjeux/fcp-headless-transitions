__ZN4HGPQ4EOTFC2Ed:
00000000000fdb20	pushq	%rbp
00000000000fdb21	movq	%rsp, %rbp
00000000000fdb24	pushq	%r15
00000000000fdb26	pushq	%r14
00000000000fdb28	pushq	%rbx
00000000000fdb29	pushq	%rax
00000000000fdb2a	movsd	%xmm0, -0x20(%rbp)
00000000000fdb2f	movq	%rdi, %rbx
00000000000fdb32	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000fdb37	leaq	0x9181c2(%rip), %rax
00000000000fdb3e	movq	%rax, (%rbx)
00000000000fdb41	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000fdb46	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fdb4b	movq	%rax, %r14
00000000000fdb4e	movq	%rax, %rdi
00000000000fdb51	callq	__ZN14HgcST2084_EOTFC1Ev        ## HgcST2084_EOTF::HgcST2084_EOTF()
00000000000fdb56	movq	%r14, 0x198(%rbx)
00000000000fdb5d	movsd	0x2d31bb(%rip), %xmm0
00000000000fdb65	divsd	-0x20(%rbp), %xmm0
00000000000fdb6a	cvtsd2ss	%xmm0, %xmm0
00000000000fdb6e	movss	%xmm0, 0x1a0(%rbx)
00000000000fdb76	addq	$0x8, %rsp
00000000000fdb7a	popq	%rbx
00000000000fdb7b	popq	%r14
00000000000fdb7d	popq	%r15
00000000000fdb7f	popq	%rbp
00000000000fdb80	retq
00000000000fdb81	movq	%rax, %r15
00000000000fdb84	movq	%r14, %rdi
00000000000fdb87	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fdb8c	movq	%rbx, %rdi
00000000000fdb8f	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fdb94	movq	%r15, %rdi
00000000000fdb97	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fdb9c	movq	%rax, %r15
00000000000fdb9f	movq	%rbx, %rdi
00000000000fdba2	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fdba7	movq	%r15, %rdi
00000000000fdbaa	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fdbaf	nop
