__ZN4HGPQ4OOTFC2Ebdd:
00000000000fe140	pushq	%rbp
00000000000fe141	movq	%rsp, %rbp
00000000000fe144	pushq	%r15
00000000000fe146	pushq	%r14
00000000000fe148	pushq	%rbx
00000000000fe149	subq	$0x28, %rsp
00000000000fe14d	movaps	%xmm1, -0x30(%rbp)
00000000000fe151	movsd	%xmm0, -0x38(%rbp)
00000000000fe156	movl	%esi, %r14d
00000000000fe159	movq	%rdi, %rbx
00000000000fe15c	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000fe161	leaq	0x918018(%rip), %rax
00000000000fe168	movq	%rax, (%rbx)
00000000000fe16b	testl	%r14d, %r14d
00000000000fe16e	je	0xfe187
00000000000fe170	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000fe175	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fe17a	movq	%rax, %r14
00000000000fe17d	movq	%rax, %rdi
00000000000fe180	callq	__ZN26HgcBT2100_PQ_OOTF_qtApproxC1Ev ## HgcBT2100_PQ_OOTF_qtApprox::HgcBT2100_PQ_OOTF_qtApprox()
00000000000fe185	jmp	0xfe19c
00000000000fe187	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000fe18c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fe191	movq	%rax, %r14
00000000000fe194	movq	%rax, %rdi
00000000000fe197	callq	__ZN17HgcBT2100_PQ_OOTFC1Ev     ## HgcBT2100_PQ_OOTF::HgcBT2100_PQ_OOTF()
00000000000fe19c	movq	%r14, 0x198(%rbx)
00000000000fe1a3	movapd	-0x30(%rbp), %xmm0
00000000000fe1a8	divsd	-0x38(%rbp), %xmm0
00000000000fe1ad	movapd	%xmm0, -0x30(%rbp)
00000000000fe1b2	movsd	0x2d2bbe(%rip), %xmm1
00000000000fe1ba	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fe1bf	movddup	%xmm0, %xmm1                    ## xmm1 = xmm0[0,0]
00000000000fe1c3	mulpd	0x2d2ed5(%rip), %xmm1
00000000000fe1cb	mulsd	0x2d2b75(%rip), %xmm0
00000000000fe1d3	unpcklpd	-0x30(%rbp), %xmm0              ## xmm0 = xmm0[0],mem[0]
00000000000fe1d8	cvtpd2ps	%xmm0, %xmm0
00000000000fe1dc	cvtpd2ps	%xmm1, %xmm1
00000000000fe1e0	unpcklpd	%xmm0, %xmm1                    ## xmm1 = xmm1[0],xmm0[0]
00000000000fe1e4	movapd	%xmm1, 0x1a0(%rbx)
00000000000fe1ec	addq	$0x28, %rsp
00000000000fe1f0	popq	%rbx
00000000000fe1f1	popq	%r14
00000000000fe1f3	popq	%r15
00000000000fe1f5	popq	%rbp
00000000000fe1f6	retq
00000000000fe1f7	jmp	0xfe1f9
00000000000fe1f9	movq	%rax, %r15
00000000000fe1fc	movq	%r14, %rdi
00000000000fe1ff	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fe204	movq	%rbx, %rdi
00000000000fe207	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe20c	movq	%r15, %rdi
00000000000fe20f	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fe214	movq	%rax, %r15
00000000000fe217	movq	%rbx, %rdi
00000000000fe21a	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe21f	movq	%r15, %rdi
00000000000fe222	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fe227	nopw	(%rax,%rax)
