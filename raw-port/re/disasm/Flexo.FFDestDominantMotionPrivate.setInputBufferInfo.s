__ZN27FFDestDominantMotionPrivate18setInputBufferInfoEiib:
0000000001361790	pushq	%rbp
0000000001361791	movq	%rsp, %rbp
0000000001361794	subq	$0x10, %rsp
0000000001361798	cvttsd2si	0x120(%rdi), %r8d
00000000013617a1	movl	%edx, %eax
00000000013617a3	cvttsd2si	0x130(%rdi), %edx
00000000013617ab	movl	%esi, %r10d
00000000013617ae	movl	%r8d, -0x8(%rbp)
00000000013617b2	movl	%edx, -0x4(%rbp)
00000000013617b5	testl	%ecx, %ecx
00000000013617b7	je	0x13617c8
00000000013617b9	cmpl	%edx, %r8d
00000000013617bc	jg	0x13617cd
00000000013617be	cmpl	$0x800, %edx                    ## imm = 0x800
00000000013617c4	jg	0x13617eb
00000000013617c6	jmp	0x136181f
00000000013617c8	cmpl	%edx, %r8d
00000000013617cb	jle	0x13617e3
00000000013617cd	cmpl	$0x800, %r8d                    ## imm = 0x800
00000000013617d4	jle	0x136181f
00000000013617d6	leaq	-0x4(%rbp), %rcx
00000000013617da	leaq	-0x8(%rbp), %rsi
00000000013617de	movl	%edx, %r9d
00000000013617e1	jmp	0x13617f9
00000000013617e3	cmpl	$0x801, %edx                    ## imm = 0x801
00000000013617e9	jl	0x136181f
00000000013617eb	leaq	-0x8(%rbp), %rcx
00000000013617ef	leaq	-0x4(%rbp), %rsi
00000000013617f3	movl	%r8d, %r9d
00000000013617f6	movl	%edx, %r8d
00000000013617f9	cvtsi2ss	%r9d, %xmm0
00000000013617fe	cvtsi2ss	%r8d, %xmm1
0000000001361803	movl	$0x800, (%rsi)                  ## imm = 0x800
0000000001361809	movss	0x211b13(%rip), %xmm2
0000000001361811	divss	%xmm1, %xmm2
0000000001361815	mulss	%xmm0, %xmm2
0000000001361819	cvttss2si	%xmm2, %edx
000000000136181d	movl	%edx, (%rcx)
000000000136181f	cvttsd2si	0x128(%rdi), %ecx
0000000001361827	movslq	-0x8(%rbp), %rsi
000000000136182b	cvttsd2si	0x138(%rdi), %r8d
0000000001361834	movslq	-0x4(%rbp), %rdx
0000000001361838	movl	0x140(%rdi), %r9d
000000000136183f	movq	(%rdi), %r11
0000000001361842	testq	%r11, %r11
0000000001361845	je	0x1361858
0000000001361847	movq	%r11, %rdi
000000000136184a	pushq	%rax
000000000136184b	pushq	%r10
000000000136184d	callq	0x1496930                       ## symbol stub for: __ZN32HFDominantMotionTrackerInterface18SetInputBufferInfoEiiiiiii
0000000001361852	addq	$0x20, %rsp
0000000001361856	popq	%rbp
0000000001361857	retq
0000000001361858	movq	0x8(%rdi), %r11
000000000136185c	testq	%r11, %r11
000000000136185f	je	0x1361872
0000000001361861	movq	%r11, %rdi
0000000001361864	pushq	%rax
0000000001361865	pushq	%r10
0000000001361867	callq	0x1496984                       ## symbol stub for: __ZN33HFDominantMotionTracker2Interface18SetInputBufferInfoEiiiiiNS_20HFDMT2I_PIXEL_FORMATENS_24HFDMT2I_PIXEL_COLORSPACEE
000000000136186c	addq	$0x20, %rsp
0000000001361870	popq	%rbp
0000000001361871	retq
0000000001361872	movq	0x10(%rdi), %rdi
0000000001361876	movl	%eax, %ecx
0000000001361878	addq	$0x10, %rsp
000000000136187c	popq	%rbp
000000000136187d	jmp	0x1496a5c                       ## symbol stub for: __ZN41HFDominant360MotionTrackerSimpleInterface18SetInputBufferInfoEmmNS_21HFD360MTSI_COLORSPACEE
0000000001361882	nopw	%cs:(%rax,%rax)
