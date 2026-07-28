__ZN18HRasterizerTextureC2Ev:
00000000000e7340	pushq	%rbp
00000000000e7341	movq	%rsp, %rbp
00000000000e7344	pushq	%r14
00000000000e7346	pushq	%rbx
00000000000e7347	movq	%rdi, %rbx
00000000000e734a	callq	__ZN20HgcRasterizerTextureC2Ev  ## HgcRasterizerTexture::HgcRasterizerTexture()
00000000000e734f	leaq	0x92a91a(%rip), %rax
00000000000e7356	movq	%rax, (%rbx)
00000000000e7359	movaps	0x2e08e0(%rip), %xmm0
00000000000e7360	movups	%xmm0, 0x1a4(%rbx)
00000000000e7367	movss	0x2e0951(%rip), %xmm0
00000000000e736f	movq	%rbx, %rdi
00000000000e7372	xorl	%esi, %esi
00000000000e7374	movaps	%xmm0, %xmm1
00000000000e7377	movaps	%xmm0, %xmm2
00000000000e737a	movaps	%xmm0, %xmm3
00000000000e737d	callq	__ZN20HgcRasterizerTexture12SetParameterEiffff ## HgcRasterizerTexture::SetParameter(int, float, float, float, float)
00000000000e7382	popq	%rbx
00000000000e7383	popq	%r14
00000000000e7385	popq	%rbp
00000000000e7386	retq
00000000000e7387	movq	%rax, %r14
00000000000e738a	movq	%rbx, %rdi
00000000000e738d	callq	__ZN20HgcRasterizerTextureD2Ev  ## HgcRasterizerTexture::~HgcRasterizerTexture()
