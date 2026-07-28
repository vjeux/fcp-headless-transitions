__ZN20HGAVATemporalAverageC2Ev:
0000000000212c70	pushq	%rbp
0000000000212c71	movq	%rsp, %rbp
0000000000212c74	pushq	%r15
0000000000212c76	pushq	%r14
0000000000212c78	pushq	%rbx
0000000000212c79	pushq	%rax
0000000000212c7a	movq	%rdi, %rbx
0000000000212c7d	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000212c82	leaq	0x81cc5f(%rip), %rax
0000000000212c89	movq	%rax, (%rbx)
0000000000212c8c	movq	$0x0, 0x198(%rbx)
0000000000212c97	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000212c9c	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000212ca1	movq	%rax, %r14
0000000000212ca4	movq	%rax, %rdi
0000000000212ca7	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000212cac	leaq	0x81c9f5(%rip), %rax
0000000000212cb3	movq	%rax, (%r14)
0000000000212cb6	movl	$0x47, %edi
0000000000212cbb	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000212cc0	leaq	0x8(%rax), %rcx
0000000000212cc4	negl	%ecx
0000000000212cc6	andl	$0x1f, %ecx
0000000000212cc9	leaq	(%rcx,%rax), %rdx
0000000000212ccd	addq	$0x8, %rdx
0000000000212cd1	movq	%rax, (%rcx,%rax)
0000000000212cd5	movaps	0x1b4f94(%rip), %xmm0
0000000000212cdc	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000212ce1	movaps	%xmm0, 0x8(%rcx,%rax)
0000000000212ce6	movq	%rdx, 0x198(%r14)
0000000000212ced	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
0000000000212cf2	andl	0x10(%r14), %eax
0000000000212cf6	orl	$0x400, %eax                    ## imm = 0x400
0000000000212cfb	movl	%eax, 0x10(%r14)
0000000000212cff	movq	0x198(%rbx), %rdi
0000000000212d06	cmpq	%r14, %rdi
0000000000212d09	je	0x212d1f
0000000000212d0b	testq	%rdi, %rdi
0000000000212d0e	je	0x212d16
0000000000212d10	movq	(%rdi), %rax
0000000000212d13	callq	*0x18(%rax)
0000000000212d16	movq	%r14, 0x198(%rbx)
0000000000212d1d	jmp	0x212d27
0000000000212d1f	movq	%r14, %rdi
0000000000212d22	callq	__ZN8HGObject7ReleaseEv         ## HGObject::Release()
0000000000212d27	addq	$0x8, %rsp
0000000000212d2b	popq	%rbx
0000000000212d2c	popq	%r14
0000000000212d2e	popq	%r15
0000000000212d30	popq	%rbp
0000000000212d31	retq
0000000000212d32	movq	%rax, %rdi
0000000000212d35	callq	___clang_call_terminate
0000000000212d3a	movq	%rax, %r15
0000000000212d3d	movq	(%r14), %rax
0000000000212d40	movq	%r14, %rdi
0000000000212d43	callq	*0x18(%rax)
0000000000212d46	jmp	0x212d6d
0000000000212d48	movq	%rax, %rdi
0000000000212d4b	callq	___clang_call_terminate
0000000000212d50	movq	%rax, %r15
0000000000212d53	movq	%r14, %rdi
0000000000212d56	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000212d5b	jmp	0x212d60
0000000000212d5d	movq	%rax, %r15
0000000000212d60	movq	%r14, %rdi
0000000000212d63	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000212d68	jmp	0x212d6d
0000000000212d6a	movq	%rax, %r15
0000000000212d6d	movq	0x198(%rbx), %rdi
0000000000212d74	testq	%rdi, %rdi
0000000000212d77	je	0x212d7f
0000000000212d79	movq	(%rdi), %rax
0000000000212d7c	callq	*0x18(%rax)
0000000000212d7f	movq	%rbx, %rdi
0000000000212d82	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000212d87	movq	%r15, %rdi
0000000000212d8a	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000212d8f	movq	%rax, %rdi
0000000000212d92	callq	___clang_call_terminate
0000000000212d97	nopw	(%rax,%rax)
__ZN20HGAVATemporalAverageC1Ev:
0000000000212da0	pushq	%rbp
0000000000212da1	movq	%rsp, %rbp
0000000000212da4	popq	%rbp
0000000000212da5	jmp	__ZN20HGAVATemporalAverageC2Ev  ## HGAVATemporalAverage::HGAVATemporalAverage()
0000000000212daa	nopw	(%rax,%rax)
__ZN20HGAVATemporalAverageD2Ev:
0000000000212db0	pushq	%rbp
0000000000212db1	movq	%rsp, %rbp
0000000000212db4	pushq	%rbx
0000000000212db5	pushq	%rax
0000000000212db6	leaq	0x81cb2b(%rip), %rax
0000000000212dbd	movq	%rax, (%rdi)
0000000000212dc0	movq	0x198(%rdi), %rax
0000000000212dc7	testq	%rax, %rax
0000000000212dca	je	0x212ddb
0000000000212dcc	movq	(%rax), %rcx
0000000000212dcf	movq	%rdi, %rbx
0000000000212dd2	movq	%rax, %rdi
0000000000212dd5	callq	*0x18(%rcx)
0000000000212dd8	movq	%rbx, %rdi
0000000000212ddb	addq	$0x8, %rsp
0000000000212ddf	popq	%rbx
0000000000212de0	popq	%rbp
0000000000212de1	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000212de6	movq	%rax, %rdi
0000000000212de9	callq	___clang_call_terminate
0000000000212dee	nop
__ZN20HGAVATemporalAverageD1Ev:
0000000000212df0	pushq	%rbp
0000000000212df1	movq	%rsp, %rbp
0000000000212df4	pushq	%rbx
0000000000212df5	pushq	%rax
0000000000212df6	leaq	0x81caeb(%rip), %rax
0000000000212dfd	movq	%rax, (%rdi)
0000000000212e00	movq	0x198(%rdi), %rax
0000000000212e07	testq	%rax, %rax
0000000000212e0a	je	0x212e1b
0000000000212e0c	movq	(%rax), %rcx
0000000000212e0f	movq	%rdi, %rbx
0000000000212e12	movq	%rax, %rdi
0000000000212e15	callq	*0x18(%rcx)
0000000000212e18	movq	%rbx, %rdi
0000000000212e1b	addq	$0x8, %rsp
0000000000212e1f	popq	%rbx
0000000000212e20	popq	%rbp
0000000000212e21	jmp	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000212e26	movq	%rax, %rdi
0000000000212e29	callq	___clang_call_terminate
0000000000212e2e	nop
__ZN20HGAVATemporalAverageD0Ev:
0000000000212e30	pushq	%rbp
0000000000212e31	movq	%rsp, %rbp
0000000000212e34	pushq	%rbx
0000000000212e35	pushq	%rax
0000000000212e36	movq	%rdi, %rbx
0000000000212e39	leaq	0x81caa8(%rip), %rax
0000000000212e40	movq	%rax, (%rdi)
0000000000212e43	movq	0x198(%rdi), %rdi
0000000000212e4a	testq	%rdi, %rdi
0000000000212e4d	je	0x212e55
0000000000212e4f	movq	(%rdi), %rax
0000000000212e52	callq	*0x18(%rax)
0000000000212e55	movq	%rbx, %rdi
0000000000212e58	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000212e5d	movq	%rbx, %rdi
0000000000212e60	addq	$0x8, %rsp
0000000000212e64	popq	%rbx
0000000000212e65	popq	%rbp
0000000000212e66	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000212e6b	movq	%rax, %rdi
0000000000212e6e	callq	___clang_call_terminate
0000000000212e73	nopw	%cs:(%rax,%rax)
__ZN20HGAVATemporalAverage9GetOutputEP10HGRenderer:
