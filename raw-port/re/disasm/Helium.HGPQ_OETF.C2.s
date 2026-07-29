__ZN4HGPQ4OETFC2Ebd:
00000000000fe6e0	pushq	%rbp
00000000000fe6e1	movq	%rsp, %rbp
00000000000fe6e4	pushq	%r15
00000000000fe6e6	pushq	%r14
00000000000fe6e8	pushq	%rbx
00000000000fe6e9	pushq	%rax
00000000000fe6ea	movsd	%xmm0, -0x20(%rbp)
00000000000fe6ef	movl	%esi, %r14d
00000000000fe6f2	movq	%rdi, %rbx
00000000000fe6f5	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000fe6fa	leaq	0x917eff(%rip), %rax
00000000000fe701	movq	%rax, (%rbx)
00000000000fe704	movsd	-0x20(%rbp), %xmm0
00000000000fe709	divsd	0x2d260f(%rip), %xmm0
00000000000fe711	movsd	0x2d2617(%rip), %xmm1
00000000000fe719	callq	0x3c54ec                        ## symbol stub for: _pow
00000000000fe71e	movddup	%xmm0, %xmm0                    ## xmm0 = xmm0[0,0]
00000000000fe722	mulpd	0x2d2956(%rip), %xmm0
00000000000fe72a	cvtpd2ps	%xmm0, %xmm0
00000000000fe72e	movlpd	%xmm0, 0x1a0(%rbx)
00000000000fe736	testl	%r14d, %r14d
00000000000fe739	je	0xfe752
00000000000fe73b	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000fe740	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fe745	movq	%rax, %r14
00000000000fe748	movq	%rax, %rdi
00000000000fe74b	callq	__ZN26HgcBT2100_PQ_OETF_qtApproxC1Ev ## HgcBT2100_PQ_OETF_qtApprox::HgcBT2100_PQ_OETF_qtApprox()
00000000000fe750	jmp	0xfe767
00000000000fe752	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000fe757	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fe75c	movq	%rax, %r14
00000000000fe75f	movq	%rax, %rdi
00000000000fe762	callq	__ZN17HgcBT2100_PQ_OETFC1Ev     ## HgcBT2100_PQ_OETF::HgcBT2100_PQ_OETF()
00000000000fe767	movq	%r14, 0x198(%rbx)
00000000000fe76e	addq	$0x8, %rsp
00000000000fe772	popq	%rbx
00000000000fe773	popq	%r14
00000000000fe775	popq	%r15
00000000000fe777	popq	%rbp
00000000000fe778	retq
00000000000fe779	jmp	0xfe77b
00000000000fe77b	movq	%rax, %r15
00000000000fe77e	movq	%r14, %rdi
00000000000fe781	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fe786	movq	%rbx, %rdi
00000000000fe789	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe78e	movq	%r15, %rdi
00000000000fe791	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fe796	movq	%rax, %r15
00000000000fe799	movq	%rbx, %rdi
00000000000fe79c	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fe7a1	movq	%r15, %rdi
00000000000fe7a4	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fe7a9	nopl	(%rax)
