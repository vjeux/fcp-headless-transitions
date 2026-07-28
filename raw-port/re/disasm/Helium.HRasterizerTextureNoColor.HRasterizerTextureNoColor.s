__ZN25HRasterizerTextureNoColorC1Ev:
0000000000055290	pushq	%rbp
0000000000055291	movq	%rsp, %rbp
0000000000055294	pushq	%r14
0000000000055296	pushq	%rbx
0000000000055297	movq	%rdi, %rbx
000000000005529a	callq	__ZN27HgcRasterizerTextureNoColorC2Ev ## HgcRasterizerTextureNoColor::HgcRasterizerTextureNoColor()
000000000005529f	leaq	0x9b283a(%rip), %rax
00000000000552a6	movq	%rax, (%rbx)
00000000000552a9	movaps	0x372990(%rip), %xmm0
00000000000552b0	movups	%xmm0, 0x1a4(%rbx)
00000000000552b7	movss	0x372a01(%rip), %xmm0
00000000000552bf	movq	%rbx, %rdi
00000000000552c2	xorl	%esi, %esi
00000000000552c4	movaps	%xmm0, %xmm1
00000000000552c7	movaps	%xmm0, %xmm2
00000000000552ca	movaps	%xmm0, %xmm3
00000000000552cd	callq	__ZN27HgcRasterizerTextureNoColor12SetParameterEiffff ## HgcRasterizerTextureNoColor::SetParameter(int, float, float, float, float)
00000000000552d2	popq	%rbx
00000000000552d3	popq	%r14
00000000000552d5	popq	%rbp
00000000000552d6	retq
00000000000552d7	movq	%rax, %r14
00000000000552da	movq	%rbx, %rdi
00000000000552dd	callq	__ZN27HgcRasterizerTextureNoColorD2Ev ## HgcRasterizerTextureNoColor::~HgcRasterizerTextureNoColor()
00000000000552e2	movq	%r14, %rdi
00000000000552e5	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000552ea	nopw	(%rax,%rax)
