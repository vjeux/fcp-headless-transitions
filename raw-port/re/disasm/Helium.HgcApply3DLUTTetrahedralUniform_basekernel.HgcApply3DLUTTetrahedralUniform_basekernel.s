__ZN42HgcApply3DLUTTetrahedralUniform_basekernelC1Ev:
000000000039ac00	pushq	%rbp
000000000039ac01	movq	%rsp, %rbp
000000000039ac04	pushq	%r14
000000000039ac06	pushq	%rbx
000000000039ac07	movq	%rdi, %rbx
000000000039ac0a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000039ac0f	leaq	0x6b74ca(%rip), %rax
000000000039ac16	movq	%rax, (%rbx)
000000000039ac19	movl	$0xe7, %edi
000000000039ac1e	callq	0x3c4fac                        ## symbol stub for: __Znam
000000000039ac23	leaq	0x8(%rax), %rcx
000000000039ac27	negl	%ecx
000000000039ac29	andl	$0x1f, %ecx
000000000039ac2c	leaq	(%rcx,%rax), %rdx
000000000039ac30	addq	$0x8, %rdx
000000000039ac34	movq	%rax, (%rcx,%rax)
000000000039ac38	xorps	%xmm0, %xmm0
000000000039ac3b	movaps	%xmm0, 0x8(%rcx,%rax)
000000000039ac40	movaps	%xmm0, 0x18(%rcx,%rax)
000000000039ac45	movaps	%xmm0, 0x28(%rcx,%rax)
000000000039ac4a	movaps	%xmm0, 0x38(%rcx,%rax)
000000000039ac4f	movaps	%xmm0, 0x48(%rcx,%rax)
000000000039ac54	movaps	%xmm0, 0x58(%rcx,%rax)
000000000039ac59	movaps	0x2cfe0(%rip), %xmm1
000000000039ac60	movaps	%xmm1, 0x78(%rcx,%rax)
000000000039ac65	movaps	%xmm1, 0x68(%rcx,%rax)
000000000039ac6a	movaps	%xmm0, 0x88(%rcx,%rax)
000000000039ac72	movaps	%xmm0, 0x98(%rcx,%rax)
000000000039ac7a	movsd	0x2f36e(%rip), %xmm0
000000000039ac82	movaps	%xmm0, 0xb8(%rcx,%rax)
000000000039ac8a	movaps	%xmm0, 0xa8(%rcx,%rax)
000000000039ac92	movq	%rdx, 0x198(%rbx)
000000000039ac99	movq	(%rbx), %rax
000000000039ac9c	movq	%rbx, %rdi
000000000039ac9f	movl	$0x1, %esi
000000000039aca4	movl	$0x1, %edx
000000000039aca9	callq	*0x88(%rax)
000000000039acaf	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
000000000039acb4	andl	0x10(%rbx), %eax
000000000039acb7	orl	$0x400, %eax                    ## imm = 0x400
000000000039acbc	movl	%eax, 0x10(%rbx)
000000000039acbf	popq	%rbx
000000000039acc0	popq	%r14
000000000039acc2	popq	%rbp
000000000039acc3	retq
000000000039acc4	movq	%rax, %r14
000000000039acc7	movq	%rbx, %rdi
000000000039acca	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000039accf	movq	%r14, %rdi
000000000039acd2	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000039acd7	nopw	(%rax,%rax)
