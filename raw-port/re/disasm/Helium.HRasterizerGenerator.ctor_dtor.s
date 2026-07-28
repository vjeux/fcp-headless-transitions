__ZN20HRasterizerGeneratorC2Ev:
0000000000030e00	pushq	%rbp
0000000000030e01	movq	%rsp, %rbp
0000000000030e04	pushq	%r14
0000000000030e06	pushq	%rbx
0000000000030e07	movq	%rdi, %rbx
0000000000030e0a	callq	__ZN22HgcRasterizerGeneratorC2Ev ## HgcRasterizerGenerator::HgcRasterizerGenerator()
0000000000030e0f	leaq	0x9d49ea(%rip), %rax
0000000000030e16	movq	%rax, (%rbx)
0000000000030e19	movaps	0x396e20(%rip), %xmm0
0000000000030e20	movups	%xmm0, 0x1a0(%rbx)
0000000000030e27	movss	0x396e91(%rip), %xmm0
0000000000030e2f	movq	%rbx, %rdi
0000000000030e32	xorl	%esi, %esi
0000000000030e34	movaps	%xmm0, %xmm1
0000000000030e37	movaps	%xmm0, %xmm2
0000000000030e3a	movaps	%xmm0, %xmm3
0000000000030e3d	callq	__ZN22HgcRasterizerGenerator12SetParameterEiffff ## HgcRasterizerGenerator::SetParameter(int, float, float, float, float)
0000000000030e42	popq	%rbx
0000000000030e43	popq	%r14
0000000000030e45	popq	%rbp
0000000000030e46	retq
0000000000030e47	movq	%rax, %r14
0000000000030e4a	movq	%rbx, %rdi
0000000000030e4d	callq	__ZN22HgcRasterizerGeneratorD2Ev ## HgcRasterizerGenerator::~HgcRasterizerGenerator()
0000000000030e52	movq	%r14, %rdi
0000000000030e55	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000030e5a	nopw	(%rax,%rax)
__ZN20HRasterizerGeneratorC1Ev:
0000000000030e60	pushq	%rbp
0000000000030e61	movq	%rsp, %rbp
0000000000030e64	pushq	%r14
0000000000030e66	pushq	%rbx
0000000000030e67	movq	%rdi, %rbx
0000000000030e6a	callq	__ZN22HgcRasterizerGeneratorC2Ev ## HgcRasterizerGenerator::HgcRasterizerGenerator()
0000000000030e6f	leaq	0x9d498a(%rip), %rax
0000000000030e76	movq	%rax, (%rbx)
0000000000030e79	movaps	0x396dc0(%rip), %xmm0
0000000000030e80	movups	%xmm0, 0x1a0(%rbx)
0000000000030e87	movss	0x396e31(%rip), %xmm0
0000000000030e8f	movq	%rbx, %rdi
0000000000030e92	xorl	%esi, %esi
0000000000030e94	movaps	%xmm0, %xmm1
0000000000030e97	movaps	%xmm0, %xmm2
0000000000030e9a	movaps	%xmm0, %xmm3
0000000000030e9d	callq	__ZN22HgcRasterizerGenerator12SetParameterEiffff ## HgcRasterizerGenerator::SetParameter(int, float, float, float, float)
0000000000030ea2	popq	%rbx
0000000000030ea3	popq	%r14
0000000000030ea5	popq	%rbp
0000000000030ea6	retq
0000000000030ea7	movq	%rax, %r14
0000000000030eaa	movq	%rbx, %rdi
0000000000030ead	callq	__ZN22HgcRasterizerGeneratorD2Ev ## HgcRasterizerGenerator::~HgcRasterizerGenerator()
0000000000030eb2	movq	%r14, %rdi
0000000000030eb5	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
0000000000030eba	nopw	(%rax,%rax)
__ZN20HRasterizerGeneratorD1Ev:
0000000000030ec0	pushq	%rbp
0000000000030ec1	movq	%rsp, %rbp
0000000000030ec4	popq	%rbp
0000000000030ec5	jmp	__ZN22HgcRasterizerGeneratorD2Ev ## HgcRasterizerGenerator::~HgcRasterizerGenerator()
0000000000030eca	nopw	(%rax,%rax)
__ZN20HRasterizerGeneratorD0Ev:
0000000000030ed0	pushq	%rbp
0000000000030ed1	movq	%rsp, %rbp
0000000000030ed4	pushq	%rbx
0000000000030ed5	pushq	%rax
0000000000030ed6	movq	%rdi, %rbx
0000000000030ed9	callq	__ZN22HgcRasterizerGeneratorD2Ev ## HgcRasterizerGenerator::~HgcRasterizerGenerator()
0000000000030ede	movq	%rbx, %rdi
0000000000030ee1	addq	$0x8, %rsp
0000000000030ee5	popq	%rbx
0000000000030ee6	popq	%rbp
0000000000030ee7	jmp	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
0000000000030eec	nopl	(%rax)
__ZN15HGRenderContextC2Ev:
