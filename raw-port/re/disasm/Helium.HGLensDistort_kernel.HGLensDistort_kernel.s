__ZN20HGLensDistort_kernelC2Ej:
000000000022a2c0	pushq	%rbp
000000000022a2c1	movq	%rsp, %rbp
000000000022a2c4	pushq	%r14
000000000022a2c6	pushq	%rbx
000000000022a2c7	movl	%esi, %ebx
000000000022a2c9	movq	%rdi, %r14
000000000022a2cc	callq	__ZN6HGNodeC2Ev                 ## HGNode::HGNode()
000000000022a2d1	leaq	0x808c08(%rip), %rax
000000000022a2d8	movq	%rax, (%r14)
000000000022a2db	movaps	0x66312e(%rip), %xmm0
000000000022a2e2	movups	%xmm0, 0x1a8(%r14)
000000000022a2ea	movaps	0x19d94f(%rip), %xmm0
000000000022a2f1	movups	%xmm0, 0x1b8(%r14)
000000000022a2f9	movaps	0x663120(%rip), %xmm0
000000000022a300	movups	%xmm0, 0x1c8(%r14)
000000000022a308	movsd	0x6356b0(%rip), %xmm0
000000000022a310	movsd	%xmm0, 0x1d8(%r14)
000000000022a319	movl	$0x3f800000, 0x1e0(%r14)        ## imm = 0x3F800000
000000000022a324	movsd	0x1a1e94(%rip), %xmm0
000000000022a32c	callq	0x3c5642                        ## symbol stub for: _tan
000000000022a331	addsd	%xmm0, %xmm0
000000000022a335	cvtsd2ss	%xmm0, %xmm0
000000000022a339	movss	%xmm0, 0x1e4(%r14)
000000000022a342	movss	0x19d976(%rip), %xmm1
000000000022a34a	divss	%xmm0, %xmm1
000000000022a34e	movss	%xmm1, 0x1e8(%r14)
000000000022a357	movq	$0x0, 0x1f0(%r14)
000000000022a362	orl	0x10(%r14), %ebx
000000000022a366	andl	$0xfffff9ff, %ebx               ## imm = 0xFFFFF9FF
000000000022a36c	orl	$0x400, %ebx                    ## imm = 0x400
000000000022a372	movl	%ebx, 0x10(%r14)
000000000022a376	popq	%rbx
000000000022a377	popq	%r14
000000000022a379	popq	%rbp
000000000022a37a	retq
000000000022a37b	nopl	(%rax,%rax)
