__ZN12HGColorGamma24m_Getv210_YXZXExpandNodeEP10HGRenderer:
00000000000f95a0	pushq	%rbp
00000000000f95a1	movq	%rsp, %rbp
00000000000f95a4	pushq	%r14
00000000000f95a6	pushq	%rbx
00000000000f95a7	movq	0x1f0(%rdi), %rax
00000000000f95ae	testq	%rax, %rax
00000000000f95b1	je	0xf95b8
00000000000f95b3	popq	%rbx
00000000000f95b4	popq	%r14
00000000000f95b6	popq	%rbp
00000000000f95b7	retq
00000000000f95b8	movq	%rdi, %r14
00000000000f95bb	movl	$0x1a0, %edi                    ## imm = 0x1A0
00000000000f95c0	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000000f95c5	movq	%rax, %rbx
00000000000f95c8	movq	%rax, %rdi
00000000000f95cb	callq	__ZN35HgcColorGamma_v210_yxzx_rgba_expandC2Ev ## HgcColorGamma_v210_yxzx_rgba_expand::HgcColorGamma_v210_yxzx_rgba_expand()
00000000000f95d0	leaq	0x91a629(%rip), %rcx
00000000000f95d7	movq	%rbx, %rax
00000000000f95da	movq	%rcx, (%rbx)
00000000000f95dd	movq	%rbx, 0x1f0(%r14)
00000000000f95e4	popq	%rbx
00000000000f95e5	popq	%r14
00000000000f95e7	popq	%rbp
00000000000f95e8	retq
00000000000f95e9	movq	%rax, %r14
00000000000f95ec	movq	%rbx, %rdi
00000000000f95ef	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000000f95f4	movq	%r14, %rdi
00000000000f95f7	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000000f95fc	nopl	(%rax)
