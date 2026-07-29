__ZN4HGPQ4EOTFC1Ed:
00000000000fdbb0	pushq	%rbp
00000000000fdbb1	movq	%rsp, %rbp
00000000000fdbb4	pushq	%r15
00000000000fdbb6	pushq	%r14
00000000000fdbb8	pushq	%rbx
00000000000fdbb9	pushq	%rax
00000000000fdbba	movsd	%xmm0, -0x20(%rbp)
00000000000fdbbf	movq	%rdi, %rbx
00000000000fdbc2	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000000fdbc7	leaq	0x918132(%rip), %rax
00000000000fdbce	movq	%rax, (%rbx)
00000000000fdbd1	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000fdbd6	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000fdbdb	movq	%rax, %r14
00000000000fdbde	movq	%rax, %rdi
00000000000fdbe1	callq	__ZN14HgcST2084_EOTFC1Ev        ## HgcST2084_EOTF::HgcST2084_EOTF()
00000000000fdbe6	movq	%r14, 0x198(%rbx)
00000000000fdbed	movsd	0x2d312b(%rip), %xmm0
00000000000fdbf5	divsd	-0x20(%rbp), %xmm0
00000000000fdbfa	cvtsd2ss	%xmm0, %xmm0
00000000000fdbfe	movss	%xmm0, 0x1a0(%rbx)
00000000000fdc06	addq	$0x8, %rsp
00000000000fdc0a	popq	%rbx
00000000000fdc0b	popq	%r14
00000000000fdc0d	popq	%r15
00000000000fdc0f	popq	%rbp
00000000000fdc10	retq
00000000000fdc11	movq	%rax, %r15
00000000000fdc14	movq	%r14, %rdi
00000000000fdc17	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000fdc1c	movq	%rbx, %rdi
00000000000fdc1f	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fdc24	movq	%r15, %rdi
00000000000fdc27	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fdc2c	movq	%rax, %r15
00000000000fdc2f	movq	%rbx, %rdi
00000000000fdc32	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000000fdc37	movq	%r15, %rdi
00000000000fdc3a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000fdc3f	nop
