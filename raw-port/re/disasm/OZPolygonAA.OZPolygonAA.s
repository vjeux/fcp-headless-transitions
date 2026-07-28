__ZN11OZPolygonAAC1Ev:
000000000015b280	pushq	%rbp
000000000015b281	movq	%rsp, %rbp
000000000015b284	pushq	%rbx
000000000015b285	pushq	%rax
000000000015b286	movq	%rdi, %rbx
000000000015b289	xorl	%esi, %esi
000000000015b28b	callq	0x6dd638                        ## symbol stub for: __ZN11PCSingletonC2Ej
000000000015b290	leaq	__ZTV11OZPolygonAA(%rip), %rax  ## vtable for OZPolygonAA
000000000015b297	addq	$0x10, %rax
000000000015b29b	movq	%rax, (%rbx)
000000000015b29e	movq	$0x40, 0x8(%rbx)
000000000015b2a6	movaps	0x5ae2b3(%rip), %xmm0
000000000015b2ad	movups	%xmm0, 0x10(%rbx)
000000000015b2b1	addq	$0x8, %rsp
000000000015b2b5	popq	%rbx
000000000015b2b6	popq	%rbp
000000000015b2b7	retq
000000000015b2b8	nopl	(%rax,%rax)
