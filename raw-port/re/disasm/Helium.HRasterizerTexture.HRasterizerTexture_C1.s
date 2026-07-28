__ZN18HRasterizerTextureC1Ev:
00000000000e73a0	pushq	%rbp
00000000000e73a1	movq	%rsp, %rbp
00000000000e73a4	pushq	%r14
00000000000e73a6	pushq	%rbx
00000000000e73a7	movq	%rdi, %rbx
00000000000e73aa	callq	__ZN20HgcRasterizerTextureC2Ev  ## HgcRasterizerTexture::HgcRasterizerTexture()
00000000000e73af	leaq	0x92a8ba(%rip), %rax
00000000000e73b6	movq	%rax, (%rbx)
00000000000e73b9	movaps	0x2e0880(%rip), %xmm0
00000000000e73c0	movups	%xmm0, 0x1a4(%rbx)
00000000000e73c7	movss	0x2e08f1(%rip), %xmm0
00000000000e73cf	movq	%rbx, %rdi
00000000000e73d2	xorl	%esi, %esi
00000000000e73d4	movaps	%xmm0, %xmm1
00000000000e73d7	movaps	%xmm0, %xmm2
00000000000e73da	movaps	%xmm0, %xmm3
00000000000e73dd	callq	__ZN20HgcRasterizerTexture12SetParameterEiffff ## HgcRasterizerTexture::SetParameter(int, float, float, float, float)
00000000000e73e2	popq	%rbx
00000000000e73e3	popq	%r14
00000000000e73e5	popq	%rbp
00000000000e73e6	retq
00000000000e73e7	movq	%rax, %r14
00000000000e73ea	movq	%rbx, %rdi
00000000000e73ed	callq	__ZN20HgcRasterizerTextureD2Ev  ## HgcRasterizerTexture::~HgcRasterizerTexture()
