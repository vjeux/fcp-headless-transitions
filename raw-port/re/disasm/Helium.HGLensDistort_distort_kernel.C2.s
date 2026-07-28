__ZN28HGLensDistort_distort_kernelC2Ev:
000000000022b400	pushq	%rbp
000000000022b401	movq	%rsp, %rbp
000000000022b404	pushq	%r14
000000000022b406	pushq	%rbx
000000000022b407	movq	%rdi, %rbx
000000000022b40a	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000022b40f	movaps	0x661ffa(%rip), %xmm0
000000000022b416	movups	%xmm0, 0x1a8(%rbx)
000000000022b41d	movaps	0x19c81c(%rip), %xmm0
000000000022b424	movups	%xmm0, 0x1b8(%rbx)
000000000022b42b	movaps	0x661fee(%rip), %xmm0
000000000022b432	movups	%xmm0, 0x1c8(%rbx)
000000000022b439	movsd	0x63457f(%rip), %xmm0
000000000022b441	movsd	%xmm0, 0x1d8(%rbx)
000000000022b449	movl	$0x3f800000, 0x1e0(%rbx)        ## imm = 0x3F800000
000000000022b453	movsd	0x1a0d65(%rip), %xmm0
000000000022b45b	callq	0x3c5642                        ## symbol stub for: _tan
000000000022b460	addsd	%xmm0, %xmm0
000000000022b464	cvtsd2ss	%xmm0, %xmm0
000000000022b468	movss	%xmm0, 0x1e4(%rbx)
000000000022b470	movss	0x19c848(%rip), %xmm1
000000000022b478	divss	%xmm0, %xmm1
000000000022b47c	movss	%xmm1, 0x1e8(%rbx)
000000000022b484	movq	$0x0, 0x1f0(%rbx)
000000000022b48f	movl	$0xfffff9fe, %eax               ## imm = 0xFFFFF9FE
000000000022b494	andl	0x10(%rbx), %eax
000000000022b497	orl	$0x401, %eax                    ## imm = 0x401
000000000022b49c	movl	%eax, 0x10(%rbx)
000000000022b49f	leaq	0x807c92(%rip), %rax
000000000022b4a6	movq	%rax, (%rbx)
000000000022b4a9	movl	$0x3a7, %edi                    ## imm = 0x3A7
000000000022b4ae	callq	0x3c4fac                        ## symbol stub for: __Znam
000000000022b4b3	leaq	0x8(%rax), %rcx
000000000022b4b7	negl	%ecx
000000000022b4b9	andl	$0x1f, %ecx
000000000022b4bc	leaq	(%rcx,%rax), %rdx
000000000022b4c0	addq	$0x8, %rdx
000000000022b4c4	movq	%rax, (%rcx,%rax)
000000000022b4c8	xorps	%xmm0, %xmm0
000000000022b4cb	movaps	%xmm0, 0x8(%rcx,%rax)
000000000022b4d0	movaps	%xmm0, 0x18(%rcx,%rax)
000000000022b4d5	movaps	%xmm0, 0x28(%rcx,%rax)
000000000022b4da	movaps	%xmm0, 0x38(%rcx,%rax)
000000000022b4df	movaps	%xmm0, 0x48(%rcx,%rax)
000000000022b4e4	movaps	%xmm0, 0x58(%rcx,%rax)
000000000022b4e9	movaps	%xmm0, 0x68(%rcx,%rax)
000000000022b4ee	movaps	%xmm0, 0x78(%rcx,%rax)
000000000022b4f3	movaps	0x6349d6(%rip), %xmm1
000000000022b4fa	movaps	%xmm1, 0x98(%rcx,%rax)
000000000022b502	movaps	%xmm1, 0x88(%rcx,%rax)
000000000022b50a	movaps	0x661f5f(%rip), %xmm1
000000000022b511	movaps	%xmm1, 0xb8(%rcx,%rax)
000000000022b519	movaps	%xmm1, 0xa8(%rcx,%rax)
000000000022b521	movsd	0x661f57(%rip), %xmm1
000000000022b529	movaps	%xmm1, 0xd8(%rcx,%rax)
000000000022b531	movaps	%xmm1, 0xc8(%rcx,%rax)
000000000022b539	movsd	0x661f4f(%rip), %xmm1
000000000022b541	movaps	%xmm1, 0xf8(%rcx,%rax)
000000000022b549	movaps	%xmm1, 0xe8(%rcx,%rax)
000000000022b551	movsd	0x661f47(%rip), %xmm1
000000000022b559	movaps	%xmm1, 0x118(%rcx,%rax)
000000000022b561	movaps	%xmm1, 0x108(%rcx,%rax)
000000000022b569	movsd	0x661f3f(%rip), %xmm1
000000000022b571	movaps	%xmm1, 0x138(%rcx,%rax)
000000000022b579	movaps	%xmm1, 0x128(%rcx,%rax)
000000000022b581	movsd	0x1a6cc7(%rip), %xmm1
000000000022b589	movaps	%xmm1, 0x158(%rcx,%rax)
000000000022b591	movaps	%xmm1, 0x148(%rcx,%rax)
000000000022b599	movsd	0x661f1f(%rip), %xmm1
000000000022b5a1	movaps	%xmm1, 0x178(%rcx,%rax)
000000000022b5a9	movaps	%xmm1, 0x168(%rcx,%rax)
000000000022b5b1	movsd	0x661f17(%rip), %xmm1
000000000022b5b9	movaps	%xmm1, 0x198(%rcx,%rax)
000000000022b5c1	movaps	%xmm1, 0x188(%rcx,%rax)
000000000022b5c9	movsd	0x661f0f(%rip), %xmm1
000000000022b5d1	movaps	%xmm1, 0x1b8(%rcx,%rax)
000000000022b5d9	movaps	%xmm1, 0x1a8(%rcx,%rax)
000000000022b5e1	movsd	0x661f07(%rip), %xmm1
000000000022b5e9	movaps	%xmm1, 0x1d8(%rcx,%rax)
000000000022b5f1	movaps	%xmm1, 0x1c8(%rcx,%rax)
000000000022b5f9	movsd	0x661eff(%rip), %xmm1
000000000022b601	movaps	%xmm1, 0x1f8(%rcx,%rax)
000000000022b609	movaps	%xmm1, 0x1e8(%rcx,%rax)
000000000022b611	movsd	0x661ef7(%rip), %xmm1
000000000022b619	movaps	%xmm1, 0x218(%rcx,%rax)
000000000022b621	movaps	%xmm1, 0x208(%rcx,%rax)
000000000022b629	movaps	0x661ef0(%rip), %xmm1
000000000022b630	movaps	%xmm1, 0x238(%rcx,%rax)
000000000022b638	movaps	%xmm1, 0x228(%rcx,%rax)
000000000022b640	movaps	0x19c5d9(%rip), %xmm1
000000000022b647	movaps	%xmm1, 0x258(%rcx,%rax)
000000000022b64f	movaps	%xmm1, 0x248(%rcx,%rax)
000000000022b657	movaps	%xmm0, 0x278(%rcx,%rax)
000000000022b65f	movaps	%xmm0, 0x268(%rcx,%rax)
000000000022b667	movss	0x661ecd(%rip), %xmm0
000000000022b66f	movaps	%xmm0, 0x298(%rcx,%rax)
000000000022b677	movaps	%xmm0, 0x288(%rcx,%rax)
000000000022b67f	movss	0x661eb9(%rip), %xmm0
000000000022b687	movaps	%xmm0, 0x2b8(%rcx,%rax)
000000000022b68f	movaps	%xmm0, 0x2a8(%rcx,%rax)
000000000022b697	movss	0x661ea5(%rip), %xmm0
000000000022b69f	movaps	%xmm0, 0x2d8(%rcx,%rax)
000000000022b6a7	movaps	%xmm0, 0x2c8(%rcx,%rax)
000000000022b6af	movss	0x661e91(%rip), %xmm0
000000000022b6b7	movaps	%xmm0, 0x2f8(%rcx,%rax)
000000000022b6bf	movaps	%xmm0, 0x2e8(%rcx,%rax)
000000000022b6c7	movss	0x661e7d(%rip), %xmm0
000000000022b6cf	movaps	%xmm0, 0x318(%rcx,%rax)
000000000022b6d7	movaps	%xmm0, 0x308(%rcx,%rax)
000000000022b6df	movss	0x661e69(%rip), %xmm0
000000000022b6e7	movaps	%xmm0, 0x338(%rcx,%rax)
000000000022b6ef	movaps	%xmm0, 0x328(%rcx,%rax)
000000000022b6f7	movss	0x661e55(%rip), %xmm0
000000000022b6ff	movaps	%xmm0, 0x358(%rcx,%rax)
000000000022b707	movaps	%xmm0, 0x348(%rcx,%rax)
000000000022b70f	movss	0x1ad159(%rip), %xmm0
000000000022b717	movaps	%xmm0, 0x378(%rcx,%rax)
000000000022b71f	movaps	%xmm0, 0x368(%rcx,%rax)
000000000022b727	movq	%rdx, 0x1f0(%rbx)
000000000022b72e	popq	%rbx
000000000022b72f	popq	%r14
000000000022b731	popq	%rbp
000000000022b732	retq
000000000022b733	movq	%rax, %r14
000000000022b736	movq	%rbx, %rdi
000000000022b739	callq	__ZN6HGNodeD2Ev                 ## HGNode::~HGNode()
000000000022b73e	movq	%r14, %rdi
000000000022b741	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
000000000022b746	nopw	%cs:(%rax,%rax)
