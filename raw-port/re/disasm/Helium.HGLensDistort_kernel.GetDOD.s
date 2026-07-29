__ZN20HGLensDistort_kernel6GetDODEP10HGRendereri6HGRect:
000000000022a400	pushq	%rbp
000000000022a401	movq	%rsp, %rbp
000000000022a404	movq	%r8, %rdx
000000000022a407	movq	%rcx, 0x198(%rdi)
000000000022a40e	movq	%r8, 0x1a0(%rdi)
000000000022a415	movq	%rcx, %xmm0
000000000022a41a	pinsrd	$0x2, %edx, %xmm0
000000000022a420	movq	%r8, %rax
000000000022a423	shrq	$0x20, %rax
000000000022a427	pinsrd	$0x3, %eax, %xmm0
000000000022a42d	paddd	0x66301b(%rip), %xmm0
000000000022a435	movq	0x1f0(%rdi), %rax
000000000022a43c	cvtdq2ps	%xmm0, %xmm0
000000000022a43f	movups	%xmm0, 0x60(%rax)
000000000022a443	movq	(%rdi), %rax
000000000022a446	movq	0x238(%rax), %rax
000000000022a44d	movq	%rcx, %rsi
000000000022a450	popq	%rbp
000000000022a451	jmpq	*%rax
000000000022a453	nopw	%cs:(%rax,%rax)
