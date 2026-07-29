__ZN21OZBSplineInterpolator15evalBSplineNURBER8OZSplined:
0000000000042704	pushq	%rbp
0000000000042705	movq	%rsp, %rbp
0000000000042708	pushq	%rbx
0000000000042709	pushq	%rax
000000000004270a	movq	%rdi, %rbx
000000000004270d	callq	__ZN21OZBSplineInterpolator30generateRationalBasisFunctionsEd ## OZBSplineInterpolator::generateRationalBasisFunctions(double)
0000000000042712	movl	0x20(%rbx), %eax
0000000000042715	testq	%rax, %rax
0000000000042718	je	0x42740
000000000004271a	movq	0x8(%rbx), %rcx
000000000004271e	movq	0x58(%rbx), %rdx
0000000000042722	xorpd	%xmm0, %xmm0
0000000000042726	xorl	%esi, %esi
0000000000042728	movsd	(%rcx,%rsi,8), %xmm1
000000000004272d	mulsd	(%rdx,%rsi,8), %xmm1
0000000000042732	addsd	%xmm1, %xmm0
0000000000042736	incq	%rsi
0000000000042739	cmpq	%rsi, %rax
000000000004273c	jne	0x42728
000000000004273e	jmp	0x42744
0000000000042740	xorpd	%xmm0, %xmm0
0000000000042744	addq	$0x8, %rsp
0000000000042748	popq	%rbx
0000000000042749	popq	%rbp
000000000004274a	retq
000000000004274b	nop
