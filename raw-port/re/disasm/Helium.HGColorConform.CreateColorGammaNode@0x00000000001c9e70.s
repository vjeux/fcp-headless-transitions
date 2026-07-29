__ZNK14HGColorConform20CreateColorGammaNodeEv:
00000000001c9e70	pushq	%rbp
00000000001c9e71	movq	%rsp, %rbp
00000000001c9e74	pushq	%r14
00000000001c9e76	pushq	%rbx
00000000001c9e77	movq	%rdi, %r14
00000000001c9e7a	movl	$0x4a0, %edi                    ## imm = 0x4A0
00000000001c9e7f	callq	__ZN8HGObjectnwEm               ## HGObject::operator new(unsigned long)
00000000001c9e84	movq	%rax, %rbx
00000000001c9e87	movq	%rax, %rdi
00000000001c9e8a	callq	__ZN12HGColorGammaC1Ev          ## HGColorGamma::HGColorGamma()
00000000001c9e8f	movzbl	0x1da(%r14), %esi
00000000001c9e97	movq	%rbx, %rdi
00000000001c9e9a	callq	__ZN12HGColorGamma26SetAntiSymmetricToneCurvesEb ## HGColorGamma::SetAntiSymmetricToneCurves(bool)
00000000001c9e9f	movq	%rbx, %rax
00000000001c9ea2	popq	%rbx
00000000001c9ea3	popq	%r14
00000000001c9ea5	popq	%rbp
00000000001c9ea6	retq
00000000001c9ea7	movq	%rax, %r14
00000000001c9eaa	movq	%rbx, %rdi
00000000001c9ead	callq	__ZN8HGObjectdlEPv              ## HGObject::operator delete(void*)
00000000001c9eb2	movq	%r14, %rdi
00000000001c9eb5	callq	0x3c4e02                        ## symbol stub for: __Unwind_Resume
00000000001c9eba	nopw	(%rax,%rax)
