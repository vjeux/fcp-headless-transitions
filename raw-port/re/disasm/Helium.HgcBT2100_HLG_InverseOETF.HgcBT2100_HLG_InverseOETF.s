__ZN25HgcBT2100_HLG_InverseOETFC1Ev:
00000000003b1e90	pushq	%rbp
00000000003b1e91	movq	%rsp, %rbp
00000000003b1e94	pushq	%r14
00000000003b1e96	pushq	%rbx
00000000003b1e97	movq	%rdi, %rbx
00000000003b1e9a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
00000000003b1e9f	leaq	0x6a2c7a(%rip), %rax
00000000003b1ea6	movq	%rax, (%rbx)
00000000003b1ea9	movl	$0x1c7, %edi                    ## imm = 0x1C7
00000000003b1eae	callq	0x3c4fac                        ## symbol stub for: __Znam
00000000003b1eb3	leaq	0x8(%rax), %rcx
00000000003b1eb7	negl	%ecx
00000000003b1eb9	andl	$0x1f, %ecx
00000000003b1ebc	leaq	(%rcx,%rax), %rdx
00000000003b1ec0	addq	$0x8, %rdx
00000000003b1ec4	movq	%rax, (%rcx,%rax)
00000000003b1ec8	xorps	%xmm0, %xmm0
00000000003b1ecb	movaps	%xmm0, 0x8(%rcx,%rax)
00000000003b1ed0	movaps	%xmm0, 0x18(%rcx,%rax)
00000000003b1ed5	movaps	%xmm0, 0x28(%rcx,%rax)
00000000003b1eda	movaps	%xmm0, 0x38(%rcx,%rax)
00000000003b1edf	movaps	0x4e2f1a(%rip), %xmm0
00000000003b1ee6	movaps	%xmm0, 0x58(%rcx,%rax)
00000000003b1eeb	movaps	%xmm0, 0x48(%rcx,%rax)
00000000003b1ef0	movaps	0x4e2f19(%rip), %xmm0
00000000003b1ef7	movaps	%xmm0, 0x78(%rcx,%rax)
00000000003b1efc	movaps	%xmm0, 0x68(%rcx,%rax)
00000000003b1f01	movaps	0x4dc108(%rip), %xmm0
00000000003b1f08	movaps	%xmm0, 0x98(%rcx,%rax)
00000000003b1f10	movaps	%xmm0, 0x88(%rcx,%rax)
00000000003b1f18	movaps	0x4dc101(%rip), %xmm0
00000000003b1f1f	movaps	%xmm0, 0xb8(%rcx,%rax)
00000000003b1f27	movaps	%xmm0, 0xa8(%rcx,%rax)
00000000003b1f2f	movaps	0x4dc0fa(%rip), %xmm0
00000000003b1f36	movaps	%xmm0, 0xd8(%rcx,%rax)
00000000003b1f3e	movaps	%xmm0, 0xc8(%rcx,%rax)
00000000003b1f46	movaps	0x4dc0f3(%rip), %xmm0
00000000003b1f4d	movaps	%xmm0, 0xf8(%rcx,%rax)
00000000003b1f55	movaps	%xmm0, 0xe8(%rcx,%rax)
00000000003b1f5d	movaps	0x4e2ebc(%rip), %xmm0
00000000003b1f64	movaps	%xmm0, 0x118(%rcx,%rax)
00000000003b1f6c	movaps	%xmm0, 0x108(%rcx,%rax)
00000000003b1f74	movaps	0x4e2eb5(%rip), %xmm0
00000000003b1f7b	movaps	%xmm0, 0x138(%rcx,%rax)
00000000003b1f83	movaps	%xmm0, 0x128(%rcx,%rax)
00000000003b1f8b	movaps	0x4dbfde(%rip), %xmm0
00000000003b1f92	movaps	%xmm0, 0x158(%rcx,%rax)
00000000003b1f9a	movaps	%xmm0, 0x148(%rcx,%rax)
00000000003b1fa2	movaps	0x4da847(%rip), %xmm0
00000000003b1fa9	movaps	%xmm0, 0x178(%rcx,%rax)
00000000003b1fb1	movaps	%xmm0, 0x168(%rcx,%rax)
00000000003b1fb9	movaps	0x4adc80(%rip), %xmm0
00000000003b1fc0	movaps	%xmm0, 0x198(%rcx,%rax)
00000000003b1fc8	movaps	%xmm0, 0x188(%rcx,%rax)
00000000003b1fd0	movq	%rdx, 0x198(%rbx)
00000000003b1fd7	movl	$0xfffff9ff, %eax               ## imm = 0xFFFFF9FF
00000000003b1fdc	andl	0x10(%rbx), %eax
00000000003b1fdf	orl	$0x400, %eax                    ## imm = 0x400
00000000003b1fe4	movl	%eax, 0x10(%rbx)
00000000003b1fe7	popq	%rbx
00000000003b1fe8	popq	%r14
00000000003b1fea	popq	%rbp
00000000003b1feb	retq
00000000003b1fec	movq	%rax, %r14
00000000003b1fef	movq	%rbx, %rdi
00000000003b1ff2	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
00000000003b1ff7	movq	%r14, %rdi
00000000003b1ffa	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000003b1fff	nop
