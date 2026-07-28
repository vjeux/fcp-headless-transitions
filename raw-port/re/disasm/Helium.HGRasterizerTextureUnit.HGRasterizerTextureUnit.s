__ZN23HGRasterizerTextureUnitC1Ev:
00000000001954e0	pushq	%rbp
00000000001954e1	movq	%rsp, %rbp
00000000001954e4	pushq	%r14
00000000001954e6	pushq	%rbx
00000000001954e7	movq	%rdi, %rbx
00000000001954ea	movl	$0x90, %edi
00000000001954ef	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001954f4	movq	%rax, %r14
00000000001954f7	movq	%rax, %rdi
00000000001954fa	callq	__ZN11HGTransformC1Ev           ## HGTransform::HGTransform()
00000000001954ff	movq	%r14, (%rbx)
0000000000195502	leaq	0x8(%rbx), %rdi
0000000000195506	callq	__ZN11HGTransformC1Ev           ## HGTransform::HGTransform()
000000000019550b	movq	$0x0, 0x98(%rbx)
0000000000195516	movsd	0x235562(%rip), %xmm0
000000000019551e	movups	%xmm0, 0xa0(%rbx)
0000000000195525	leaq	_HGRectNull(%rip), %rax
000000000019552c	movups	(%rax), %xmm0
000000000019552f	movups	%xmm0, 0xb0(%rbx)
0000000000195536	movw	$0x0, 0xc0(%rbx)
000000000019553f	movb	$0x0, 0xc2(%rbx)
0000000000195546	xorps	%xmm0, %xmm0
0000000000195549	movups	%xmm0, 0xc4(%rbx)
0000000000195550	popq	%rbx
0000000000195551	popq	%r14
0000000000195553	popq	%rbp
0000000000195554	retq
0000000000195555	movq	%rax, %rbx
0000000000195558	movq	%r14, %rdi
000000000019555b	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000195560	movq	%rbx, %rdi
0000000000195563	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000195568	nopl	(%rax,%rax)
