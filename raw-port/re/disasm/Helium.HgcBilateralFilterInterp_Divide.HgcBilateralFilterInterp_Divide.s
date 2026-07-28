__ZN31HgcBilateralFilterInterp_DivideC1Ev:
000000000031aba0	pushq	%rbp
000000000031aba1	movq	%rsp, %rbp
000000000031aba4	pushq	%r14
000000000031aba6	pushq	%rbx
000000000031aba7	movq	%rdi, %rbx
000000000031abaa	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000031abaf	leaq	0x727e02(%rip), %rax
000000000031abb6	movq	%rax, (%rbx)
000000000031abb9	movl	$0x87, %edi
000000000031abbe	callq	0x3c4fac                        ## symbol stub for: __Znam
000000000031abc3	leaq	0x8(%rax), %rcx
000000000031abc7	negl	%ecx
000000000031abc9	andl	$0x1f, %ecx
000000000031abcc	leaq	(%rcx,%rax), %rdx
000000000031abd0	addq	$0x8, %rdx
000000000031abd4	movq	%rax, (%rcx,%rax)
000000000031abd8	movaps	0x576d51(%rip), %xmm0
000000000031abdf	movaps	%xmm0, 0x18(%rcx,%rax)
000000000031abe4	movaps	%xmm0, 0x8(%rcx,%rax)
000000000031abe9	movaps	0x576d50(%rip), %xmm0
000000000031abf0	movaps	%xmm0, 0x38(%rcx,%rax)
000000000031abf5	movaps	%xmm0, 0x28(%rcx,%rax)
000000000031abfa	movaps	0x5452cf(%rip), %xmm0
000000000031ac01	movaps	%xmm0, 0x58(%rcx,%rax)
000000000031ac06	movaps	%xmm0, 0x48(%rcx,%rax)
000000000031ac0b	movq	%rdx, 0x198(%rbx)
000000000031ac12	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
000000000031ac17	andl	0x10(%rbx), %eax
000000000031ac1a	orl	$0x400, %eax                    ## imm = 0x400
000000000031ac1f	movl	%eax, 0x10(%rbx)
000000000031ac22	popq	%rbx
000000000031ac23	popq	%r14
000000000031ac25	popq	%rbp
000000000031ac26	retq
000000000031ac27	movq	%rax, %r14
000000000031ac2a	movq	%rbx, %rdi
000000000031ac2d	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000031ac32	movq	%r14, %rdi
000000000031ac35	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000031ac3a	nopw	(%rax,%rax)
