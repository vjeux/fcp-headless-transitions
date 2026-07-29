__ZN4HGPQ11InverseEOTFC1Ed:
00000000000fdeb0	pushq	%rbp
00000000000fdeb1	movq	%rsp, %rbp
00000000000fdeb4	pushq	%r15
00000000000fdeb6	pushq	%r14
00000000000fdeb8	pushq	%rbx
00000000000fdeb9	pushq	%rax
00000000000fdeba	movsd	%xmm0, -0x20(%rbp)
00000000000fdebf	movq	%rdi, %rbx
00000000000fdec2	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000fdec7	leaq	0x918072(%rip), %rax
00000000000fdece	movq	%rax, (%rbx)
00000000000fded1	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000fded6	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fdedb	movq	%rax, %r14
00000000000fdede	movq	%rax, %rdi
00000000000fdee1	callq	__ZN21HgcST2084_InverseEOTFC1Ev ## HgcST2084_InverseEOTF::HgcST2084_InverseEOTF()
00000000000fdee6	movq	%r14, 0x198(%rbx)
00000000000fdeed	movsd	-0x20(%rbp), %xmm0
00000000000fdef2	divsd	0x2d2e26(%rip), %xmm0
00000000000fdefa	movsd	0x2d2e2e(%rip), %xmm1
00000000000fdf02	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fdf07	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000000fdf0b	mulpd	0x2d316d(%rip), %xmm0
00000000000fdf13	cvtpd2ps	%xmm0, %xmm0
00000000000fdf17	movlpd	%xmm0, 0x1a0(%rbx)
00000000000fdf1f	addq	$0x8, %rsp
00000000000fdf23	popq	%rbx
00000000000fdf24	popq	%r14
00000000000fdf26	popq	%r15
00000000000fdf28	popq	%rbp
00000000000fdf29	retq
00000000000fdf2a	movq	%rax, %r15
00000000000fdf2d	movq	%r14, %rdi
00000000000fdf30	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fdf35	movq	%rbx, %rdi
00000000000fdf38	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fdf3d	movq	%r15, %rdi
00000000000fdf40	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fdf45	movq	%rax, %r15
00000000000fdf48	movq	%rbx, %rdi
00000000000fdf4b	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fdf50	movq	%r15, %rdi
00000000000fdf53	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fdf58	nopl	(%rax,%rax)
