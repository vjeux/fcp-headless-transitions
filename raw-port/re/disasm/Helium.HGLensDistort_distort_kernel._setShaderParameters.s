__ZN28HGLensDistort_distort_kernel20_setShaderParametersEv:
000000000022b8a0	pushq	%rbp
000000000022b8a1	movq	%rsp, %rbp
000000000022b8a4	pushq	%rbx
000000000022b8a5	pushq	%rax
000000000022b8a6	movq	%rdi, %rbx
000000000022b8a9	movss	0x1c4(%rdi), %xmm0
000000000022b8b1	movss	0x1c8(%rdi), %xmm1
000000000022b8b9	movss	0x1cc(%rdi), %xmm2
000000000022b8c1	movss	0x1d0(%rdi), %xmm3
000000000022b8c9	movq	(%rdi), %rax
000000000022b8cc	xorl	%esi, %esi
000000000022b8ce	callq	*0x60(%rax)
000000000022b8d1	movss	0x1b0(%rbx), %xmm0
000000000022b8d9	movss	0x1b4(%rbx), %xmm1
000000000022b8e1	movq	(%rbx), %rax
000000000022b8e4	xorps	%xmm2, %xmm2
000000000022b8e7	xorps	%xmm3, %xmm3
000000000022b8ea	movq	%rbx, %rdi
000000000022b8ed	movl	$0x1, %esi
000000000022b8f2	callq	*0x60(%rax)
000000000022b8f5	movss	0x1dc(%rbx), %xmm0
000000000022b8fd	movss	0x1e0(%rbx), %xmm1
000000000022b905	cvtss2sd	%xmm1, %xmm1
000000000022b909	mulsd	0x661c1f(%rip), %xmm1
000000000022b911	cvtsd2ss	%xmm1, %xmm1
000000000022b915	movss	0x1e8(%rbx), %xmm2
000000000022b91d	movq	(%rbx), %rax
000000000022b920	xorps	%xmm3, %xmm3
000000000022b923	movq	%rbx, %rdi
000000000022b926	movl	$0x2, %esi
000000000022b92b	callq	*0x60(%rax)
000000000022b92e	movq	(%rbx), %rax
000000000022b931	movq	0x60(%rax), %rax
000000000022b935	movss	0x19e7d3(%rip), %xmm0
000000000022b93d	movss	0x19c37b(%rip), %xmm2
000000000022b945	movq	%rbx, %rdi
000000000022b948	movl	$0x3, %esi
000000000022b94d	movaps	%xmm0, %xmm1
000000000022b950	movaps	%xmm2, %xmm3
000000000022b953	addq	$0x8, %rsp
000000000022b957	popq	%rbx
000000000022b958	popq	%rbp
000000000022b959	jmpq	*%rax
000000000022b95b	nopl	(%rax,%rax)
