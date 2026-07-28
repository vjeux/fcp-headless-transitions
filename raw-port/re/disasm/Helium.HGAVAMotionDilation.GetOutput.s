__ZN19HGAVAMotionDilation9GetOutputEP10HGRenderer:
0000000000216a80	pushq	%rbp
0000000000216a81	movq	%rsp, %rbp
0000000000216a84	pushq	%r15
0000000000216a86	pushq	%r14
0000000000216a88	pushq	%r12
0000000000216a8a	pushq	%rbx
0000000000216a8b	movq	%rsi, %r15
0000000000216a8e	movq	%rdi, %rbx
0000000000216a91	movzbl	0x1a0(%rdi), %r12d
0000000000216a99	movl	$0x1a0, %edi                    ## imm = 0x1A0
0000000000216a9e	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
0000000000216aa3	movq	%rax, %r14
0000000000216aa6	cmpb	$0x1, %r12b
0000000000216aaa	jne	0x216b41
0000000000216ab0	movq	%r14, %rdi
0000000000216ab3	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000216ab8	leaq	0x8194e9(%rip), %rax
0000000000216abf	movq	%rax, (%r14)
0000000000216ac2	movl	$0x47, %edi
0000000000216ac7	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000216acc	leaq	0x8(%rax), %rcx
0000000000216ad0	negl	%ecx
0000000000216ad2	andl	$0x1f, %ecx
0000000000216ad5	leaq	(%rcx,%rax), %rdx
0000000000216ad9	addq	$0x8, %rdx
0000000000216add	movq	%rax, (%rcx,%rax)
0000000000216ae1	movaps	0x675d08(%rip), %xmm0
0000000000216ae8	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000216aed	movaps	%xmm0, 0x8(%rcx,%rax)
0000000000216af2	movq	%rdx, 0x198(%r14)
0000000000216af9	movq	%r14, %rdi
0000000000216afc	xorl	%esi, %esi
0000000000216afe	movl	$0x1, %edx
0000000000216b03	callq	__ZN6HGNode8SetFlagsEii         ## HGNode::SetFlags(int, int)
0000000000216b08	movl	$0xfffff9fe, %eax               ## imm = 0xFFFFF9FE
0000000000216b0d	andl	0x10(%r14), %eax
0000000000216b11	orl	$0x401, %eax                    ## imm = 0x401
0000000000216b16	movl	%eax, 0x10(%r14)
0000000000216b1a	movq	0x198(%rbx), %rdi
0000000000216b21	cmpq	%r14, %rdi
0000000000216b24	je	0x216c19
0000000000216b2a	testq	%rdi, %rdi
0000000000216b2d	je	0x216b35
0000000000216b2f	movq	(%rdi), %rax
0000000000216b32	callq	*0x18(%rax)
0000000000216b35	movq	%r14, 0x198(%rbx)
0000000000216b3c	jmp	0x216c29
0000000000216b41	movq	%r14, %rdi
0000000000216b44	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
0000000000216b49	leaq	0x819698(%rip), %rax
0000000000216b50	movq	%rax, (%r14)
0000000000216b53	movl	$0x87, %edi
0000000000216b58	callq	0x3c4fac                        ## symbol stub for: __Znam
0000000000216b5d	leaq	0x8(%rax), %rcx
0000000000216b61	negl	%ecx
0000000000216b63	andl	$0x1f, %ecx
0000000000216b66	leaq	(%rcx,%rax), %rdx
0000000000216b6a	addq	$0x8, %rdx
0000000000216b6e	movq	%rax, (%rcx,%rax)
0000000000216b72	movaps	0x1b10c7(%rip), %xmm0
0000000000216b79	movaps	%xmm0, 0x18(%rcx,%rax)
0000000000216b7e	movaps	%xmm0, 0x8(%rcx,%rax)
0000000000216b83	xorps	%xmm0, %xmm0
0000000000216b86	movaps	%xmm0, 0x28(%rcx,%rax)
0000000000216b8b	movaps	%xmm0, 0x38(%rcx,%rax)
0000000000216b90	movaps	0x6490a9(%rip), %xmm0
0000000000216b97	movaps	%xmm0, 0x58(%rcx,%rax)
0000000000216b9c	movaps	%xmm0, 0x48(%rcx,%rax)
0000000000216ba1	movq	%rdx, 0x198(%r14)
0000000000216ba8	movq	(%r14), %rax
0000000000216bab	movq	%r14, %rdi
0000000000216bae	xorl	%esi, %esi
0000000000216bb0	movl	$0x1, %edx
0000000000216bb5	callq	*0x88(%rax)
0000000000216bbb	movq	(%r14), %rax
0000000000216bbe	movq	%r14, %rdi
0000000000216bc1	movl	$0x1, %esi
0000000000216bc6	movl	$0x1, %edx
0000000000216bcb	callq	*0x88(%rax)
0000000000216bd1	movq	(%r14), %rax
0000000000216bd4	movq	%r14, %rdi
0000000000216bd7	movl	$0x2, %esi
0000000000216bdc	movl	$0x1, %edx
0000000000216be1	callq	*0x88(%rax)
0000000000216be7	movl	$0xfffff9fe, %eax               ## imm = 0xFFFFF9FE
0000000000216bec	andl	0x10(%r14), %eax
0000000000216bf0	orl	$0x401, %eax                    ## imm = 0x401
0000000000216bf5	movl	%eax, 0x10(%r14)
0000000000216bf9	movq	0x198(%rbx), %rdi
0000000000216c00	cmpq	%r14, %rdi
0000000000216c03	je	0x216c40
0000000000216c05	testq	%rdi, %rdi
0000000000216c08	je	0x216c10
0000000000216c0a	movq	(%rdi), %rax
0000000000216c0d	callq	*0x18(%rax)
0000000000216c10	movq	%r14, 0x198(%rbx)
0000000000216c17	jmp	0x216c50
0000000000216c19	movq	(%r14), %rax
0000000000216c1c	movq	%r14, %rdi
0000000000216c1f	callq	*0x18(%rax)
0000000000216c22	movq	0x198(%rbx), %r14
0000000000216c29	movq	%r15, %rdi
0000000000216c2c	movq	%rbx, %rsi
0000000000216c2f	xorl	%edx, %edx
0000000000216c31	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000216c36	movq	(%r14), %rcx
0000000000216c39	movq	%r14, %rdi
0000000000216c3c	xorl	%esi, %esi
0000000000216c3e	jmp	0x216cb5
0000000000216c40	movq	(%r14), %rax
0000000000216c43	movq	%r14, %rdi
0000000000216c46	callq	*0x18(%rax)
0000000000216c49	movq	0x198(%rbx), %r14
0000000000216c50	movq	%r15, %rdi
0000000000216c53	movq	%rbx, %rsi
0000000000216c56	xorl	%edx, %edx
0000000000216c58	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000216c5d	movq	(%r14), %rcx
0000000000216c60	movq	%r14, %rdi
0000000000216c63	xorl	%esi, %esi
0000000000216c65	movq	%rax, %rdx
0000000000216c68	callq	*0x78(%rcx)
0000000000216c6b	movq	0x198(%rbx), %r14
0000000000216c72	movq	%r15, %rdi
0000000000216c75	movq	%rbx, %rsi
0000000000216c78	movl	$0x1, %edx
0000000000216c7d	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000216c82	movq	(%r14), %rcx
0000000000216c85	movq	%r14, %rdi
0000000000216c88	movl	$0x1, %esi
0000000000216c8d	movq	%rax, %rdx
0000000000216c90	callq	*0x78(%rcx)
0000000000216c93	movq	0x198(%rbx), %r14
0000000000216c9a	movq	%r15, %rdi
0000000000216c9d	movq	%rbx, %rsi
0000000000216ca0	movl	$0x2, %edx
0000000000216ca5	callq	__ZN10HGRenderer8GetInputEP6HGNodei ## HGRenderer::GetInput(HGNode*, int)
0000000000216caa	movq	(%r14), %rcx
0000000000216cad	movq	%r14, %rdi
0000000000216cb0	movl	$0x2, %esi
0000000000216cb5	movq	%rax, %rdx
0000000000216cb8	callq	*0x78(%rcx)
0000000000216cbb	movq	0x198(%rbx), %rax
0000000000216cc2	popq	%rbx
0000000000216cc3	popq	%r12
0000000000216cc5	popq	%r14
0000000000216cc7	popq	%r15
0000000000216cc9	popq	%rbp
0000000000216cca	retq
0000000000216ccb	movq	%rax, %rdi
0000000000216cce	callq	___clang_call_terminate
0000000000216cd3	movq	%rax, %rdi
0000000000216cd6	callq	___clang_call_terminate
0000000000216cdb	movq	%rax, %rbx
0000000000216cde	movq	(%r14), %rax
0000000000216ce1	movq	%r14, %rdi
0000000000216ce4	callq	*0x18(%rax)
0000000000216ce7	jmp	0x216d23
0000000000216ce9	movq	%rax, %rdi
0000000000216cec	callq	___clang_call_terminate
0000000000216cf1	movq	%rax, %rbx
0000000000216cf4	movq	(%r14), %rax
0000000000216cf7	movq	%r14, %rdi
0000000000216cfa	callq	*0x18(%rax)
0000000000216cfd	jmp	0x216d23
0000000000216cff	movq	%rax, %rdi
0000000000216d02	callq	___clang_call_terminate
0000000000216d07	jmp	0x216d09
0000000000216d09	movq	%rax, %rbx
0000000000216d0c	jmp	0x216d1b
0000000000216d0e	jmp	0x216d10
0000000000216d10	movq	%rax, %rbx
0000000000216d13	movq	%r14, %rdi
0000000000216d16	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
0000000000216d1b	movq	%r14, %rdi
0000000000216d1e	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000216d23	movq	%rbx, %rdi
0000000000216d26	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000216d2b	nopl	(%rax,%rax)
