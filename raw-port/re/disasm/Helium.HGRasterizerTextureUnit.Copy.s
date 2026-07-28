__ZN23HGRasterizerTextureUnit4CopyEPS_:
00000000001a01c0	pushq	%rbp
00000000001a01c1	movq	%rsp, %rbp
00000000001a01c4	pushq	%r14
00000000001a01c6	pushq	%rbx
00000000001a01c7	movq	%rsi, %rbx
00000000001a01ca	movq	%rdi, %r14
00000000001a01cd	movq	(%rdi), %rdi
00000000001a01d0	movq	(%rsi), %rsi
00000000001a01d3	movq	(%rdi), %rax
00000000001a01d6	callq	*0x60(%rax)
00000000001a01d9	movups	0xa0(%rbx), %xmm0
00000000001a01e0	movups	%xmm0, 0xa0(%r14)
00000000001a01e8	movups	0xb0(%rbx), %xmm0
00000000001a01ef	movups	%xmm0, 0xb0(%r14)
00000000001a01f7	movzbl	0xc0(%rbx), %eax
00000000001a01fe	movb	%al, 0xc0(%r14)
00000000001a0205	movzbl	0xc1(%rbx), %eax
00000000001a020c	movb	%al, 0xc1(%r14)
00000000001a0213	movzbl	0xc2(%rbx), %eax
00000000001a021a	movb	%al, 0xc2(%r14)
00000000001a0221	movss	0xc4(%rbx), %xmm0
00000000001a0229	movss	%xmm0, 0xc4(%r14)
00000000001a0232	movss	0xc8(%rbx), %xmm0
00000000001a023a	movss	%xmm0, 0xc8(%r14)
00000000001a0243	movss	0xcc(%rbx), %xmm0
00000000001a024b	movss	%xmm0, 0xcc(%r14)
00000000001a0254	movss	0xd0(%rbx), %xmm0
00000000001a025c	movss	%xmm0, 0xd0(%r14)
00000000001a0265	popq	%rbx
00000000001a0266	popq	%r14
00000000001a0268	popq	%rbp
00000000001a0269	retq
00000000001a026a	nopw	(%rax,%rax)
