__ZN11OZImageNode13getDimensionsEPfS0_RK13OZRenderState:
00000000001a3d10	pushq	%rbp
00000000001a3d11	movq	%rsp, %rbp
00000000001a3d14	pushq	%r14
00000000001a3d16	pushq	%rbx
00000000001a3d17	subq	$0x20, %rsp
00000000001a3d1b	movq	%rdx, %rbx
00000000001a3d1e	movq	%rsi, %r14
00000000001a3d21	xorps	%xmm0, %xmm0
00000000001a3d24	movaps	%xmm0, -0x30(%rbp)
00000000001a3d28	movaps	0x561691(%rip), %xmm0
00000000001a3d2f	movaps	%xmm0, -0x20(%rbp)
00000000001a3d33	movq	(%rdi), %rax
00000000001a3d36	leaq	-0x30(%rbp), %rsi
00000000001a3d3a	movq	%rcx, %rdx
00000000001a3d3d	callq	*0x10(%rax)
00000000001a3d40	movsd	-0x20(%rbp), %xmm0
00000000001a3d45	cvtsd2ss	%xmm0, %xmm0
00000000001a3d49	movss	%xmm0, (%r14)
00000000001a3d4e	movsd	-0x18(%rbp), %xmm0
00000000001a3d53	cvtsd2ss	%xmm0, %xmm0
00000000001a3d57	movss	%xmm0, (%rbx)
00000000001a3d5b	addq	$0x20, %rsp
00000000001a3d5f	popq	%rbx
00000000001a3d60	popq	%r14
00000000001a3d62	popq	%rbp
00000000001a3d63	retq
00000000001a3d64	nopw	%cs:(%rax,%rax)
